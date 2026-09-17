---
name: deploy-prod
description: >-
  Promotes develop to staging, staging to main, cuts a vX.Y.Z release, and
  watches Deploy with quiet API polling. Use when the user asks to deploy
  prod, promote to production, or run the release train.
---

# Deploy production

Run only when the user asked to deploy prod / promote through to production. Production branch is `main` (not `master`).

Workflow `name:` values, in order:

1. **Promote to staging** (`environment: staging`)
2. **Promote to main** (`environment: production-promote`)
3. **Cut release** with version `X.Y.Z` (`environment: production`)
4. Watch the **Deploy** run Cut release dispatches. A green Cut release is not a green deploy.

The agent cannot approve GitHub Environments. Never force-push `main`, skip hooks, update git config, or print secrets.

## Version

If the user passed `X.Y.Z` (no `v` prefix), use it. Otherwise **execute**:

```powershell
.cursor/skills/deploy-prod/scripts/next-patch.ps1
```

State that version in the kickoff line, then proceed. Do not invent a minor or major. If the script fails because there is no tag, stop and ask for a version.

## Preflight

Do this before any `gh workflow run`, so a reviewer is not asked to approve a doomed run. One `gh`/`git` check is fine; do not narrate each command.

1. `gh` is authenticated (`gh auth status`).
2. develop tip has a successful CI run:

```powershell
gh run list --commit <develop-sha> --workflow CI --json conclusion,status
```

3. Fast-forward is possible. After `git fetch origin develop staging main`:

- `git merge-base --is-ancestor origin/staging origin/develop` (staging ff from develop)
- `git merge-base --is-ancestor origin/main origin/staging` (main ff from staging)

If CI is not green or either ancestor check fails, stop and explain. Do not force, and do not switch the promote workflows to merge commits.

## Dispatch and watch

Each `gh workflow run` prints a run URL. Parse its numeric id and watch that run directly (do not rely on list matching alone):

```powershell
$started = [DateTime]::UtcNow.ToString('o')
$prior = gh run list --workflow "Promote to staging" --limit 1 --json databaseId --jq ".[0].databaseId"
$dispatchUrl = gh workflow run "Promote to staging"
if ($dispatchUrl -notmatch '/runs/(\d+)') { throw "Could not parse run id from: $dispatchUrl" }
$runId = [long]$Matches[1]
.cursor/skills/deploy-prod/scripts/watch-run.ps1 -Workflow "Promote to staging" -RunId $runId
```

Repeat with `"Promote to main"`, then `"Cut release" -f version=<X.Y.Z>`. For Deploy, pass `-HeadBranch v<X.Y.Z>` (the tag Cut release pushed) and a timestamp taken **before** Cut release, because Deploy starts during that workflow. If you have the Deploy run URL from logs, prefer `-RunId` there too.

Start `watch-run.ps1` in the background (`block_until_ms` 0) with `notify_on_output` on `^(WAITING_APPROVAL|FAILED|SUCCEEDED)`. Do **not** use `gh run watch`. Do not poll `gh` yourself while the watcher is running.

Output:

- Kickoff: one line (stages + version).
- `WAITING_APPROVAL`: one line with the URL, then silence. Do not start a second watcher; the same process keeps polling.
- `SUCCEEDED`: one line, then the next stage.
- `FAILED`: stop. Fetch logs once (`gh run view <id> --log-failed`) and follow Failure mode. Ignore a later process-exit notification if you already handled the sentinel.

## Failure mode

An environment wait is not a failure.

- Repo or workflow bug: fix on `develop`, commit with [commit.ps1](../writing-commit-messages/scripts/commit.ps1), push, wait for green CI, then re-dispatch **only the failed stage**. Do not patch `main` directly.
- Environment rejection, missing secrets, or VPS/SSH/`/health` failure: report the failed step and stop. Do not invent credentials, SSH in, or retry production blindly.
