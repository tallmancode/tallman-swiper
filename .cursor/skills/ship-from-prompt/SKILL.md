---
name: ship-from-prompt
description: >-
  Ships local work end-to-end: invent title if needed, optional GitHub issue,
  branch as type/slug, commit if dirty, ensure Conventional Commit type labels,
  push, and open a PR to develop. Use when the user asks to ship, push-and-PR,
  or open a PR from current work with branching and labels handled.
alwaysApply: false
---

# Ship from Prompt

End-to-end ship workflow. Compose these skills (read and follow; do not copy their tables):

- [writing-commit-messages](../writing-commit-messages/SKILL.md) — commit format and scopes; **execute** `scripts/commit.ps1`
- [creating-pull-requests](../creating-pull-requests/SKILL.md) — PR judgment + **execute** `scripts/create-pr.ps1`

Scripts own fragile git/gh mechanics. This skill owns judgment (title, type, summary, staging).

## Safety

Only run when the user asked to ship / push-and-PR / open a PR from current work. Never update git config; never force-push to `main`/`master`; never skip hooks unless asked; never commit secrets (`.env`, credentials).

## Workflow

### 1. Gather state (parallel)

1. `git status` — dirty / untracked
2. `git diff` — staged and unstaged
3. Branch tracking (`git status -sb`)
4. `git log` and `git diff develop...HEAD` (or the user-specified base)

### 2. Title and type

1. Infer the Conventional Commit **type** from the change or user wording (same Types list as writing-commit-messages).
2. If the user gave a title → use it (normalize to a conventional subject when it clearly includes a type).
3. Else invent a short imperative title from the prompt + diff.
4. Branch slug: kebab-case from the title (e.g. `photo-prefetch`, `swipe-curve`).

### 3. Branch

**Execute:**

```powershell
.cursor/skills/ship-from-prompt/scripts/ensure-branch.ps1 -Type feat -Slug photo-prefetch
```

Creates `<type>/<slug>` when on `develop` / `main` / `master`. Otherwise keeps the current feature branch. Pass `-Force` only when the user wants a new branch name from a non-integration branch.

### 4. Optional issue

Create a GitHub issue **only** when the user explicitly asks for one. **Execute:**

```powershell
.cursor/skills/ship-from-prompt/scripts/create-issue.ps1 -Title "<title>" -Body "<prompt / description>"
```

Use the printed URL/number for `-IssueRef` on the PR (`Closes #N` when the PR fully addresses it, otherwise `Refs #N`).

### 5. Commit if dirty

- **Dirty:** draft message via writing-commit-messages, then **execute** `../writing-commit-messages/scripts/commit.ps1` (with `-Paths` or after staging; exclude secrets).
- **Clean:** skip commit; PR existing commits on the branch.

### 6. Push and PR

Draft Summary (1–3 bullets) and Test plan checklist from the full branch diff. Then **execute:**

```powershell
.cursor/skills/creating-pull-requests/scripts/create-pr.ps1 `
  -Title "<title>" `
  -Type feat `
  -Base develop `
  -Summary @"
- Bullet one
- Bullet two
"@ `
  -TestPlan @"
- [ ] Checklist item
"@
```

Use `-Base` only when the user named another base (default is `develop`). Add `-IssueRef "Closes #N"` / `"Refs #N"` when an issue was created.

`create-pr.ps1` ensures the type label, pushes, opens the PR, and prints the URL.

Return the issue URL (if any) and the PR URL.
