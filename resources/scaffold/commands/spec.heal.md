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

### Step 1.5: Inline vs Sub-Agent Decision

If **<= 15 total findings**: apply all fixes yourself inline using Edit. Read the specific files via their paths (use repo-map to understand relationships if needed). Continue to Step 3.

If **> 15 findings**: proceed to Step 2.

### Step 2: Delegate to Sub-Agents (large fix sets only)

> Skip if Step 1.5 applied (most cases).

Group findings by file. Classify by complexity:
- **Mechanical** (type annotations, assertion changes, logging, renaming, narrowing) → **Haiku** sub-agent (`model: "haiku"`)
- **Structural** (refactoring logic, new code paths, architecture changes) → **Sonnet** sub-agent (`model: "sonnet"`)

Launch independent file groups **in parallel**. Each sub-agent receives: file paths (NOT full content), specific findings (rule ID, category, line, proposed fix), and instructions to read the file themselves, apply the fix via Edit, and consult `.claude/specify/context/repo-map.md` for module relationships. Do NOT embed full file content or best-practices docs in the prompt.

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
