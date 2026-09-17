---
name: creating-pull-requests
description: >-
  Create GitHub pull requests with gh: branch push, PR body template, and
  Conventional Commit type labels (create missing labels from the commit Types
  list). Use when the user asks to open a PR, create a pull request, or push
  and PR a branch.
alwaysApply: false
---

# Creating Pull Requests

Use `gh` for all GitHub PR work. Follow the user's git safety protocol: never update git config; never force-push to main/master; never skip hooks unless asked; do not push or open a PR unless the user asked.

For end-to-end ship (title/branch/commit-if-dirty + PR), use [ship-from-prompt](../ship-from-prompt/SKILL.md). This skill is the **PR-only** path.

Default PR base is **`develop`**. Override only when the user names another base.

## Before creating

Run in parallel:

1. `git status` — untracked / dirty state
2. `git diff` — staged and unstaged
3. Branch tracking / whether push is needed (`git status -sb`, remote tracking)
4. `git log` and `git diff <base>...HEAD` — full commit history since diverging from base

Analyze **all** commits that will be in the PR (not only the latest), then draft the summary.

## Create the PR

1. Create a new branch if needed
2. Draft title, Summary bullets, and Test plan checklist
3. Pick the type label (table below)
4. **Execute** the scripts (do not reimplement fragile `gh` / PowerShell body wiring):

```powershell
# Ensure label only (optional; create-pr.ps1 calls this):
.cursor/skills/creating-pull-requests/scripts/ensure-type-label.ps1 -Type feat

.cursor/skills/creating-pull-requests/scripts/create-pr.ps1 `
  -Title "feat(swiper): prefetch next card image" `
  -Type feat `
  -Base develop `
  -Summary @"
- Prefetch the upcoming card while the current swipe settles
- Avoid blank frames on slow connections
"@ `
  -TestPlan @"
- [ ] Next card image is ready after a swipe
- [ ] No console errors when Pexels is slow
"@
```

Optional: `-IssueRef "Closes #12"` or `-IssueRef "Refs #12"`.

`create-pr.ps1` ensures the type label, pushes with `-u` when there is no upstream (never force-push), creates the PR, and prints the URL.

Requires `git` and authenticated GitHub CLI (`gh`).

Return the PR URL when done.

## Labels (required)

Every PR gets a **type label** matching the primary Conventional Commit type for the change (same list as [writing-commit-messages](../writing-commit-messages/SKILL.md) **Types**):

| Label      | When                                |
| ---------- | ----------------------------------- |
| `feat`     | New user-facing feature             |
| `fix`      | Bug fix                             |
| `refactor` | Restructure without behavior change |
| `docs`     | Documentation only                  |
| `test`     | Tests                               |
| `chore`    | Build, tooling, deps                |
| `perf`     | Performance                         |
| `ci`       | GitHub Actions / workflows          |
| `revert`   | Revert a previous commit            |

Do **not** skip labeling because the label is missing — `ensure-type-label.ps1` / `create-pr.ps1` create it. Do **not** invent labels outside this Types list unless the user explicitly asks for another label.
