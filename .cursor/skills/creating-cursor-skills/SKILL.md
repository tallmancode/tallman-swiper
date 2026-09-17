---
name: creating-cursor-skills
description: Guides the creation of Agent Skills for Cursor — markdown instruction files that teach the agent specialized workflows (PR review, commit message format, DB schema queries, etc). Use when the user wants to create, edit, or improve a Cursor skill, asks how skills work, or references SKILL.md, ~/.cursor/skills/, or .cursor/skills/.
---

# Creating Cursor Skills

## Before Starting: Gather Requirements

Ask about (use AskQuestion if available, otherwise conversationally):

1. **Purpose**: what task/workflow does this skill support?
2. **Location**: personal (`~/.cursor/skills/`) or project (`.cursor/skills/`)?
3. **Triggers**: when should the agent apply it automatically?
4. **Domain knowledge**: what does the agent not already know?
5. **Output format**: templates, styles, required structure?
6. **Existing patterns**: conventions already in use?

If prior conversation context makes the purpose clear, infer instead of asking.

## File Structure

```
skill-name/
├── SKILL.md              # required
├── reference.md          # optional — detailed docs
├── examples.md           # optional — usage examples
└── scripts/               # optional — utility scripts
```

| Type     | Path                           | Scope           |
| -------- | ------------------------------ | --------------- |
| Personal | `~/.cursor/skills/skill-name/` | All projects    |
| Project  | `.cursor/skills/skill-name/`   | Shared via repo |

**Never** create skills in `~/.cursor/skills-cursor/` — reserved for Cursor's built-in skills.

### SKILL.md frontmatter

```markdown
---
name: your-skill-name
description: Brief description of what this does and when to use it
---
```

- `name`: max 64 chars, lowercase letters/numbers/hyphens only
- `description`: max 1024 chars, third person, states both WHAT the skill does and WHEN to apply it (e.g. "Extracts text and tables from PDF files, fills forms, merges documents. Use when the user mentions PDFs or document extraction.")

## Core Authoring Principles

1. **Be concise.** The agent is already capable — only add what it doesn't know. Cut any sentence that doesn't earn its token cost.
2. **Keep SKILL.md under 500 lines.** Push detailed reference material to separate files.
3. **Progressive disclosure, one level deep.** Link from SKILL.md straight to `reference.md`/`examples.md` — don't nest references further, or they risk partial reads.
4. **Match freedom to fragility**: open text instructions for judgment calls (e.g. review guidelines), templates for preferred-but-flexible patterns (e.g. reports), exact scripts for fragile/consistency-critical operations (e.g. migrations).

## Common Patterns & Anti-Patterns

See [reference.md](reference.md) for the Template, Examples, Workflow, Conditional, and Feedback-Loop patterns, plus the five anti-patterns to avoid (Windows paths, too many options, time-sensitive info, inconsistent terminology, vague names) and a full worked example.

## Skill Creation Workflow

1. **Discovery** — purpose, location, triggers, constraints, existing patterns.
2. **Design** — draft the name; write a specific third-person description; outline sections; decide if reference files/scripts are needed.
3. **Implementation** — create the directory, write SKILL.md frontmatter + body, add any reference files or scripts.
4. **Verification** — check against the checklist below.

## Verification Checklist

- [ ] Frontmatter present; `name` and `description` valid
- [ ] Description is third person, specific, states WHAT and WHEN
- [ ] SKILL.md body under 500 lines
- [ ] Consistent terminology throughout
- [ ] Examples are concrete, not abstract
- [ ] File references one level deep; progressive disclosure used where the file would otherwise be long
- [ ] No time-sensitive information (use "current vs. deprecated" sections instead)
- [ ] Scripts (if any): solve the problem outright, document required packages, no Windows-style paths
