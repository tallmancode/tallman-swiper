---
name: writing-commit-messages
description: >-
  Write Conventional Commit messages with tallman-swiper scopes (swiper,
  photos, server, docker, ci, docs). Use when the user asks to commit, write a
  commit message, or craft a git commit subject/body.
alwaysApply: false
---

# Writing Commit Messages

Follow the user's git safety protocol: only commit when asked; never amend/force-push/skip hooks unless they explicitly request it; never commit secrets (`.env`, credentials).

For end-to-end branch + commit + PR, use [ship-from-prompt](../ship-from-prompt/SKILL.md) instead.

## Format

```
<type>(<optional scope>): <subject>

<optional body>

<optional footer>
```

- Subject ≤ 50 chars, imperative mood, no capital after the type prefix, no trailing period
- Body explains **why**, not what (the diff shows what)

### Types

| Type       | When                                |
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

### Scopes (this repo)

Vue 3 + Express app (`tallman-swiper`) — not a multi-app monorepo. **Prefer omitting scope** (matches this repo's history). When a scope helps, use:

| Scope    | When                                                          |
| -------- | ------------------------------------------------------------- |
| `swiper` | Vue UI / swipe logic under `src/components`, `src/utils/swiper*` |
| `photos` | Pexels / `usePhotos` / photo API client                       |
| `server` | Express under `server/`                                       |
| `sentry` | Sentry wiring                                                 |
| `docker` | root `Dockerfile`, `docker-compose.yml`, `deploy/`            |
| `ci`     | `.github/workflows/`                                          |
| `docs`   | `docs/`, `DEPLOYMENT.md`, `README.md`                         |

Omit scope when the change spans many areas or is truly repo-wide.

### Examples

```
feat(swiper): add swipe-out animation curve
fix(photos): retry Pexels fetch on timeout
chore(docker): pin Node alpine image tag
docs: document VPS compose env vars
ci: harden production deploy workflow permissions
```

Breaking: `feat(server)!: ...` and/or a `BREAKING CHANGE:` footer with migration notes.

## Commit via script

Draft the message using the format above, then **execute** (do not reimplement):

```powershell
# Already staged:
.cursor/skills/writing-commit-messages/scripts/commit.ps1 -Message @"
type(scope): subject

Why this change.
"@

# Or stage specific paths (script refuses secret paths):
.cursor/skills/writing-commit-messages/scripts/commit.ps1 -Message "fix(photos): retry Pexels fetch on timeout" -Paths src/composables/usePhotos.ts
```

Requires `git`. Uses a PowerShell here-string — never bash `$(cat <<'EOF')`.
