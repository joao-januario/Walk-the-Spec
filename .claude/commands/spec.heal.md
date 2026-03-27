---
description: Apply fixes for all actionable findings (CRITICAL, HIGH, MEDIUM, LOW) from the most recent /spec.review. NEEDS_REFACTOR is excluded (tracked in refactor-backlog.md).
model: sonnet
---

## User Input

```text
$ARGUMENTS
```

Consider user input before proceeding.

**Status Signal**: Run `bash .claude/specify/scripts/bash/bootstrap-phase.sh --command "spec.heal" --phase heal --json` to signal command start.

## Goal

Read review findings from `.claude/specs/<BRANCH_NAME>/review.md` and apply proposed fixes for all actionable findings. Counterpart to `/spec.review` — review finds problems, heal applies corrections.

## Execution Steps

### Step 1: Load Review Findings

Determine branch via `git rev-parse --abbrev-ref HEAD`. Read `.claude/specs/<BRANCH_NAME>/review.md`. If missing: ERROR — run `/spec.review` first. Parse findings table and proposed fixes; extract all except NEEDS_REFACTOR. If no actionable findings: "Nothing to heal. Run `/spec.conclude`."

### Step 1.5: Small Branch Optimization

If **<= 3 files** to fix AND **<= 5 total findings**: skip sub-agents, apply all fixes inline using Edit, continue to Step 3.

### Step 2: Apply Fixes via Sub-Agents

> Skip if Small Branch Optimization applied.

Group findings by file. Classify by complexity:
- **Mechanical** (type annotations, assertion changes, logging, renaming, narrowing) → **Haiku** sub-agent (`model: "haiku"`)
- **Structural** (refactoring logic, new code paths, architecture changes) → **Sonnet** sub-agent (`model: "sonnet"`)

Launch independent file groups **in parallel**. Each sub-agent receives: full file content, specific findings (rule ID, category, line, current/proposed code), referenced best practices rules, and instructions to locate code, apply proposed fix via Edit, skip if code changed since review, and report results.

### Step 3: Run Tests

```bash
npm test
```

Pass → Step 4. Fail → identify causal fix, revert it, re-run tests to confirm, mark as "Fix requires manual intervention — broke tests", continue with remaining.

### Step 4: Update Review Artifact

Update `.claude/specs/<BRANCH_NAME>/review.md`: mark fixes as `FIXED`, `SKIPPED`, or `MANUAL` with reason. Add Heal Summary section:

```markdown
## Heal Summary

**Date**: YYYY-MM-DD
**Applied**: N fixes | **Skipped**: N | **Reverted**: N (broke tests)

| # | Rule | Status | Notes |
|---|------|--------|-------|
```

### Step 5: Report Completion

Report applied/total fixes and test status. List remaining MEDIUM/LOW findings. If CRITICAL findings remain unfixed: WARN. Suggest `/spec.dive` for code deep-dives or `/spec.conclude` to finalize.

## Scope Rules

- All actionable findings (CRITICAL, HIGH, MEDIUM, LOW) are fixed; NEEDS_REFACTOR excluded (tracked in refactor-backlog.md)
- Each fix independent — one broken fix doesn't block others
- Tests are the safety net — revert any fix that breaks them

**Status Signal**: Run `bash .claude/specify/scripts/bash/teardown-phase.sh --command "spec.heal" --json` to signal command completion.

## Error Handling

| Condition | Action |
|-----------|--------|
| No review.md | Stop, run `/spec.review` first |
| No actionable findings | Nothing to do, suggest `/spec.conclude` |
| File changed since review | Skip that fix, note it |
| Fix breaks tests | Revert, mark manual, continue |
| All fixes fail | Report all as manual |
