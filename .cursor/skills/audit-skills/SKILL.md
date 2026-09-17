---
name: audit-skills
description: Reviews installed Cursor/Agent skills and classifies each as redundant, partially redundant, or valuable on knowledge vs process-discipline axes. Use when auditing skills, cleaning up .cursor/skills, or asking whether a skill is worth keeping.
---

# Audit Skills

Review all installed skills and assess whether each teaches something the model does not already know from training.

Skills are invoked on demand (or agent-requested by description). Unlike rules, they do not need an activation-mode axis — focus on **knowledge** and **process discipline**.

## Step 1: Collect skills from all sources

Gather skill directories from these locations:

1. **Project skills:** `.cursor/skills/` in the current working directory
2. **Personal/global skills:** `~/.cursor/skills/` (resolve symlinks to find actual `SKILL.md` files)
3. **Built-in / plugin skills:** `~/.cursor/skills-cursor/` and `~/.cursor/plugins/cache/**/skills/` when present
4. **Agent skills:** `.agents/skills/` (project) and `~/.agents/skills/` (user)

For each location, list all directories containing a `SKILL.md` file. Record the source location alongside each skill name.

Do not scan `.claude/skills/` unless the user explicitly asks to include Claude skill trees.

## Step 2: Read and classify each skill

For each skill found, read its `SKILL.md` (frontmatter + body, skip reference files for now).

Evaluate each skill on **two independent axes**, then classify:

### Axis 1: Knowledge — Does it teach something the model doesn't know?

Examples of novel knowledge: project conventions, repo-specific patterns, uncommon domain expertise, curated decision logic, specialized tooling (e.g., jscpd for duplication detection).

### Axis 2: Process discipline — Does it enforce a workflow the model wouldn't follow on its own?

This is the axis most commonly misjudged. A skill can be "redundant" on knowledge but **critical** on process. Ask these questions:

| Process signal                  | What to look for                                                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Hard stops / approval gates** | Does it force the model to pause and wait for user input between phases? (Models batch by default)                        |
| **Measurement-before-action**   | Does it require baselines, profiling, or evidence before changes? (Models skip measurement by default)                    |
| **Scope constraints**           | Does it limit how much the model does per cycle? (One transformation per commit, 80/20 rule, stop at diminishing returns) |
| **Anti-pattern tables**         | Does it list specific rationalizations to watch for? ("Bottleneck is obvious", "I'll batch these", "Too late to measure") |
| **Tool-enforced coverage**      | Does it use external tools (jscpd, k6, linters) that catch things invisible to manual review?                             |
| **Push-back instructions**      | Does it tell the model to refuse or challenge the user's request in specific situations?                                  |

**Key insight:** "I know how to do X" ≠ "I will reliably follow the disciplined process for X." Knowledge and discipline are independent axes.

### Classification matrix

| Category                          | Knowledge        | Process             | Criteria                                                                                                                   |
| --------------------------------- | ---------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Redundant**                     | Known            | No discipline added | Teaches only general knowledge the model already has, with no workflow enforcement                                         |
| **Valuable — process discipline** | Known or unknown | Enforces workflow   | Constrains model behavior: hard stops, measurement gates, scope limits, anti-pattern guards, or external tool requirements |
| **Valuable — project-specific**   | Unknown          | Either              | Encodes project conventions, team workflows, or repo-specific patterns the model cannot know                               |
| **Valuable — novel knowledge**    | Unknown          | Either              | Provides specialized domain expertise, uncommon techniques, or curated decision logic                                      |
| **Partially redundant**           | Mixed            | Mixed               | Some sections are valuable (on either axis), others repeat known information without adding discipline                     |

## Step 3: Report findings

Present results in this format:

### Redundant skills

For each: skill name, source location, one-line reason why it duplicates built-in knowledge **and** adds no process discipline.

### Partially redundant skills

For each: skill name, source location, which sections are valuable vs redundant, noting both axes.

### Valuable skills (group by primary value type)

**Process discipline:** skill name, source location, what workflow it enforces that the model wouldn't follow unprompted.

**Project-specific:** skill name, source location, what project knowledge it encodes.

**Novel knowledge:** skill name, source location, what specialized expertise it provides.

### Summary

- Total skills scanned
- Count per category
- Recommended actions (remove, trim, keep)

## Common misclassification trap

**Do NOT classify a skill as "redundant" just because you know the domain.** The question is not "do I know how to refactor/optimize/detect duplication?" — the question is "will I reliably follow this specific process without the skill enforcing it?"

Examples of skills that look redundant but aren't:

- A refactoring skill that forces one-transformation-per-commit (you'd batch 5 without it)
- A performance skill that blocks optimization until baseline is measured (you'd skip measurement without it)
- A duplication skill that runs jscpd (you can't token-compare every file pair manually)

**Test:** If the skill contains hard stops, anti-pattern tables, measurement gates, or external tool invocations — it is almost certainly providing process value even if the knowledge feels familiar.
