---
name: hotfix-deploy
description: >-
  Merges a hotfix/* branch onto main (PR or ff-only), cuts a patch release,
  watches Deploy, and back-merges main into staging and develop. Use when the
  user asks to hotfix, deploy a hotfix branch, or ship hotfix/* to production.
---

# Hotfix deploy

Run only when the user asked to deploy a hotfix. Production branch is `main` (not `master`). This repo has no **Hotfix to main** workflow — merge onto `main` manually, then reuse Cut release / Deploy from [deploy-prod](../deploy-prod/SKILL.md).

The branch is the one they named, otherwise the current branch. It must match `^hotfix/[A-Za-z0-9._/-]+$` and must not contain `..`. If it does not, stop.

Reuse the quiet watcher and version script from deploy-prod. Do **not** use `gh run watch`.

## Preflight

1. `git fetch origin main hotfix/...` and confirm `git merge-base --is-ancestor origin/main origin/<hotfix>`. If main has moved, stop and say the hotfix must be rebased onto `origin/main`. Do not force-push `main`.
2. Working tree must be clean before any merge.
3. CI does **not** run on `hotfix/**` pushes (only `main`, `develop`, `staging`). Require a successful CI run on the tip before merging:
   - Prefer opening a PR to `main` so CI runs on the PR head, then wait for green CI (`watch-run.ps1` with `-Workflow CI` when a run id is known).
   - Or, if CI already succeeded for that SHA (e.g. after a prior PR), confirm with `gh run list --commit <sha> --workflow CI`.
   If CI is still running, watch it and stay quiet unless it fails.

## Merge, release, watch

1. Merge the hotfix onto `main` (prefer PR when branch protection or review is needed):

```powershell
# Preferred: PR into main, merge when CI is green
.cursor/skills/creating-pull-requests/scripts/create-pr.ps1 `
  -Title "fix: <hotfix subject>" `
  -Type fix `
  -Base main `
  -Summary @"
- Hotfix: <one-line why>
"@ `
  -TestPlan @"
- [ ] Production smoke after Deploy
"@
# Then: gh pr merge <number> --merge  (or --squash only if the user asked)
```

```powershell
# Alternative when a direct ff merge is allowed:
git fetch origin main hotfix/<name>
git switch main
git merge --ff-only origin/hotfix/<name>
git push origin main
```

Never `--force`. If ff-only fails, stop and rebase the hotfix (or open a PR); do not create a merge commit on `main` unless the user explicitly asks.

2. After `main` includes the hotfix tip, back-merge **before** tagging so `main` is not left ahead of `staging` during the production approval wait. See Back-merge.
3. Version: user-supplied `X.Y.Z`, otherwise **execute** `../deploy-prod/scripts/next-patch.ps1` (patch only).
4. `gh workflow run "Cut release" -f version=<X.Y.Z>`, watch that run, then watch **Deploy** with `-HeadBranch v<X.Y.Z>`. A green Cut release is not a green deploy.

Kickoff is one line (branch + version). Each success is one line.

## Back-merge

Push the back-merge with the user token so CI runs and the next fast-forward promote still works.

```powershell
git fetch origin main staging develop
git switch staging
git merge origin/main -m "merge main into staging after hotfix"
git push origin staging
git switch develop
git merge origin/staging -m "merge staging into develop after hotfix"
git push origin develop
```

Use a merge commit only when fast-forward is impossible. Never `--force`. If push is rejected, open PRs with [create-pr.ps1](../creating-pull-requests/scripts/create-pr.ps1) (`-Base staging`, then `-Base develop`) and stop with the URLs. If either merge conflicts, stop and resolve on that branch — do not force.

Quiet-watch CI on `staging` and `develop` after the pushes. Speak only if CI fails.

A Deploy failure does not skip this back-merge. If it was not done, say so.

## Failure mode

Same rules as deploy-prod, except repo fixes land on the `hotfix/*` branch (not `main`, not `develop`). Re-merge to `main` only after that SHA is green on CI. Environment, secret, or VPS/`/health` failures: report the step and stop. Never print secrets.
