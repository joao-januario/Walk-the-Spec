---
description: Review this project's Claude context setup against research-backed best practices and fix anything that isn't within parameters.
---

## User Input

```text
$ARGUMENTS
```

## Goal

Review each area of this project's Claude context setup against the rules below. For any area not within parameters, make targeted improvements until it is. Keep going until every area passes.

## Rules

**CLAUDE.md**
- Under 150 lines
- Contains only non-inferrable content — nothing derivable from `package.json`, `tsconfig`, `git log`, or a directory listing
- Has an on-demand loading strategy (routing table or equivalent) so not all context loads every session

**Always-on total**
- All auto-loaded files combined under 150 lines
- Auto-loaded = CLAUDE.md plus anything explicitly flagged as auto-loaded within it

**Memory files** (`.claude/projects/*/memory/*.md` or equivalent)
- Only: user preferences, feedback, non-obvious corrections, project decisions
- Not: code patterns, architecture descriptions, file paths, tech stack snapshots

**Command files** (`.claude/commands/*.md`)
- Each file under 200 lines

**Best-practices files** (`.claude/best-practices/*.md`)
- Not referenced in CLAUDE.md — must be on-demand only
- Must have rule IDs (e.g. `EA-01`) so findings can be traced

## Execution

Find the project root via `git rev-parse --show-toplevel`. Then for each area:

1. Read the relevant files
2. Check against the rules for that area
3. If all rules pass — note it and move on
4. If any rule fails — make the targeted fix, then re-check
5. Continue until the area passes

At the end, report what was changed and what was already healthy.

## Operating Principles

- Fix the minimum needed to bring each area within parameters — do not over-edit
- If removing content from CLAUDE.md is ambiguous (genuinely unclear whether it is inferrable), preserve it and flag for human review instead of removing it
- Never delete memory files — edit their content if needed
- Changes to CLAUDE.md must preserve all non-inferrable content exactly
