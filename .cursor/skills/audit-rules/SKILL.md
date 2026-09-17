---
name: audit-rules
description: >-
  Reviews installed Cursor Rules and classifies each as redundant, partially
  redundant, or valuable on knowledge, process-discipline, and activation-mode
  axes. Use when auditing rules, cleaning up .cursor/rules, or asking whether a
  rule is worth keeping or correctly activated.
---

# Audit Rules

Review all installed Cursor Rules and assess whether each teaches something the model does not already know, and whether it is configured to actually fire when it should.

Rules differ from on-demand skills in a key way: they are not invoked by name, they are injected as standing context according to an **activation mode**. A rule can be perfectly written and still worthless if it never loads, or perfectly redundant and still costly if it loads on every single request. This audit therefore adds a third axis — activation correctness — on top of the knowledge/process framework.

## Step 1: Collect rules from all sources

Gather rule files from these locations:

- **Project rules:** `.cursor/rules/**/*.mdc` in the current working directory, including nested `.cursor/rules/` folders in subdirectories (these scope automatically to that subtree)
- **Legacy project rules:** a root-level `.cursorrules` file, if present (deprecated — flag for migration, see Step 4)
- **AGENTS.md:** in the project root or subdirectories, as a plain-markdown alternative to `.mdc` rules
- **User/global rules:** the contents of Cursor Settings → Rules ("User Rules"); if these are exported or mirrored to a file on disk, read that file — otherwise note that they must be checked manually in-app since they are not always filesystem-visible
- **Team rules:** if the workspace is on a Cursor plan with admin-managed Team Rules, note that these take precedence over project rules and should be listed separately, even if not editable locally

For each location, list every rule found, its filename, and its frontmatter (`description`, `globs`, `alwaysApply`) or lack thereof.

## Step 2: Read and classify each rule on knowledge and process

For each rule, read the full file: frontmatter plus body.

### Axis 1: Knowledge — Does it teach something the model doesn't know?

Examples of novel knowledge: this repo's architecture or naming conventions, internal library APIs, team style preferences, business logic constraints, non-obvious build/deploy quirks.

### Axis 2: Process discipline — Does it enforce a workflow the model wouldn't follow on its own?

| Process signal              | What to look for                                                                                         |
| --------------------------- | -------------------------------------------------------------------------------------------------------- |
| Hard stops / approval gates | Does it require confirmation before destructive or wide-reaching actions?                                |
| Measurement-before-action   | Does it require checking tests, types, or a baseline before changes are made?                            |
| Scope constraints           | Does it cap the size or blast radius of a single change?                                                 |
| Anti-pattern tables         | Does it name specific mistakes to avoid in this codebase?                                                |
| Tool-enforced coverage      | Does it require running a specific linter, formatter, or test command before finishing?                  |
| Push-back instructions      | Does it tell the model to flag or refuse certain requests (e.g., "never edit generated files directly")? |

Use the same classification matrix as [audit-skills](../audit-skills/SKILL.md): Redundant / Valuable — process discipline / Valuable — project-specific / Valuable — novel knowledge / Partially redundant.

## Step 3: Check activation correctness (rules-specific)

This step has no equivalent in the skills audit and is often where rules quietly fail. For each rule, determine its activation mode from the frontmatter and check whether it fits the content:

| Mode            | Frontmatter                                           | Fires when                                   | Common misconfiguration                                                                                                                                     |
| --------------- | ----------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Always Apply    | `alwaysApply: true`                                   | Every single request                         | Content too broad or too long for something paid on every request — flag if it exceeds roughly 200 words or isn't truly universal                           |
| Auto Attached   | `globs: <pattern>`, no `alwaysApply`                  | A matching file is in context                | Glob too broad (matches unrelated files, wasting tokens) or too narrow (misses files it should cover)                                                       |
| Agent Requested | `description` present, no globs, `alwaysApply: false` | Model decides relevance from the description | Vague or generic description that the model is unlikely to match against a real prompt — check whether the description is specific enough to be retrievable |
| Manual          | No globs, no strong description                       | Only via explicit `@rule-name` mention       | Content that is actually important enough to need automatic firing, but is misconfigured as manual-only so it's rarely invoked                              |

For each rule, state: declared mode, whether that mode matches the rule's actual importance/scope, and a corrected mode if it's mismatched.

Also check for:

- **Token budget:** total combined size of all `alwaysApply: true` rules. Flag if the always-on set is large enough to meaningfully tax every request (Cursor's own guidance targets keeping the always-apply set lean).
- **Overlap or conflict:** two rules that give contradictory instructions, or that duplicate each other's scope with different glob patterns.
- **Dead globs:** a `globs` pattern that doesn't match any file currently in the repo (rule never fires in practice).

## Step 4: Report findings

Present results in this format:

**Redundant rules** — name, location, activation mode, one-line reason it duplicates built-in knowledge and adds no process discipline.

**Partially redundant rules** — name, location, which sections are valuable vs redundant.

**Valuable rules** (group by primary value type)

- _Process discipline:_ name, location, activation mode, workflow enforced.
- _Project-specific:_ name, location, activation mode, knowledge encoded.
- _Novel knowledge:_ name, location, activation mode, expertise provided.

**Misconfigured activation** — name, location, declared mode vs. recommended mode, and why (e.g., "important security rule set to Manual, should be Always Apply or a tight glob").

**Migration flags** — any legacy `.cursorrules` file found (recommend migrating its contents into scoped `.mdc` files); any rule whose intent is better served by AGENTS.md or vice versa.

**Summary**

- Total rules scanned, by source (project / legacy / AGENTS.md / user / team)
- Count per knowledge/process category
- Count per activation-mode issue
- Estimated always-apply token footprint
- Recommended actions (remove, trim, re-scope glob, change activation mode, migrate)

## Common misclassification traps

1. **Knowledge trap (same as skills):** don't mark a rule "redundant" just because the convention it states is generic-sounding. If the model would default to a different convention without the rule, the rule is doing work.
2. **Activation trap (rules-specific):** a rule can be excellent content and still be functionally dead if its glob never matches, its description is too vague for Agent Requested mode to retrieve it, or it's stuck on Manual and nobody ever `@mentions` it. Always check whether the rule _actually fires_, not just whether its content would help if it did.
3. **Cost trap (rules-specific):** an `alwaysApply: true` rule that is only marginally useful is worse than a skill that's marginally useful, because the rule's cost is paid on every request whether or not it's relevant to that request.
