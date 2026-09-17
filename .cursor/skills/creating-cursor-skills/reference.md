# Reference: Patterns, Anti-Patterns, and a Complete Example

## Patterns

**Template** — give an exact output shape:

```markdown
# [Analysis Title]

## Executive summary

[One paragraph]

## Key findings

- Finding 1 with supporting data

## Recommendations

1. Specific actionable recommendation
```

**Examples** — pair input → output when quality depends on seeing the target format:

```
Input: Added user authentication with JWT tokens
Output:
feat(auth): implement JWT-based authentication

Add login endpoint and token validation middleware
```

**Workflow** — checklist for multi-step operations:

```
- [ ] Analyze the form
- [ ] Create field mapping
- [ ] Validate mapping
- [ ] Fill the form
- [ ] Verify output
```

**Conditional** — branch on decision points:

```
Creating new content? → Creation workflow
Editing existing content? → Editing workflow
```

**Feedback loop** — for quality-critical tasks:

```
1. Make edits
2. Validate: python scripts/validate.py output/
3. If it fails, fix and re-validate
4. Only proceed once validation passes
```

## Utility Scripts

Prefer pre-made scripts over generated code — more reliable, cheaper on tokens, consistent across runs. State clearly whether the agent should **execute** a script or **read** it as reference.

## Anti-Patterns

| Anti-pattern                                                       | Fix                                                                             |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| Windows-style paths (`scripts\helper.py`)                          | Use `scripts/helper.py`                                                         |
| Listing every possible library ("use pypdf, or pdfplumber, or...") | Give one default + an escape hatch for the exception case                       |
| Time-sensitive phrasing ("before August 2025, use...")             | Split into "Current method" vs. a collapsed "Old patterns (deprecated)" section |
| Inconsistent terms ("URL" / "route" / "path" for the same thing)   | Pick one term, use it everywhere                                                |
| Vague skill names (`helper`, `utils`)                              | Specific names (`processing-pdfs`, `analyzing-spreadsheets`)                    |

## Complete Example

```
code-review/
├── SKILL.md
├── STANDARDS.md
└── examples.md
```

**SKILL.md:**

```markdown
---
name: code-review
description: Reviews code for quality, security, and maintainability following team standards. Use when reviewing pull requests, examining code changes, or when the user asks for a code review.
---

# Code Review

## Quick Start

1. Check correctness and potential bugs
2. Verify security best practices
3. Assess readability and maintainability
4. Ensure tests are adequate

## Review Checklist

- [ ] Logic correct, handles edge cases
- [ ] No security vulnerabilities (SQL injection, XSS, etc.)
- [ ] Follows project style conventions
- [ ] Functions appropriately sized and focused
- [ ] Error handling comprehensive
- [ ] Tests cover the changes

## Feedback Format

- 🔴 Critical: must fix before merge
- 🟡 Suggestion: consider improving
- 🟢 Nice to have: optional enhancement

## Additional Resources

- Coding standards: [STANDARDS.md](STANDARDS.md)
- Example reviews: [examples.md](examples.md)
```
