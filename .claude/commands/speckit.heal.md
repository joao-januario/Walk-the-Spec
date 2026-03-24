---
description: Apply fixes for CRITICAL and HIGH findings from the most recent /speckit.review. Reads review.md and applies proposed code changes.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Goal

Read the review findings from `.claude/specs/<BRANCH_NAME>/review.md` and apply the proposed fixes for CRITICAL and HIGH severity findings. This is the counterpart to `/speckit.review` — review finds problems, heal applies corrections.

## Execution Steps

### Step 1: Load Review Findings

Determine the current branch:

```bash
git rev-parse --abbrev-ref HEAD
```

Read `.claude/specs/<BRANCH_NAME>/review.md`.

If the file doesn't exist: ERROR — "No review found. Run `/speckit.review` first."

Parse the findings table and proposed fixes sections. Extract all CRITICAL and HIGH findings with their proposed code changes.

If no CRITICAL or HIGH findings exist: "Nothing to heal. All findings are MEDIUM/LOW. Run `/speckit.conclude` to finalize."

### Step 2: Present Fix Plan

Show the user what will be changed:

```markdown
## Heal Plan

**Review**: .claude/specs/<BRANCH>/review.md
**Findings to fix**: N CRITICAL, N HIGH

| # | Rule | Category | File | Summary |
|---|------|----------|------|---------|
| 1 | ES04 | CRITICAL | src/preload/index.ts | Raw ipcRenderer exposed |
| 2 | RT03 | HIGH | src/renderer/src/App.tsx | Uses `any` type |

Proceed? (yes/no)
```

Wait for user confirmation. If no, stop.

### Step 3: Apply Fixes via Sonnet Agents

Group findings by file. For each file (or small group of related files), spawn a **Sonnet sub-agent** using the Agent tool with `model: "sonnet"`. Launch independent file groups **in parallel**.

Each sub-agent prompt MUST include:

1. The full current content of the file(s) to fix
2. The specific findings (rule ID, category, line, current code, proposed fix) from review.md
3. The applicable best practices document content for context
4. Clear instructions:

```
You are applying code fixes. For each finding:
1. Read the current file content
2. Locate the code matching the "Current" snippet
3. Apply the "Proposed" fix from the review
4. If the code has changed since the review and the snippet can't be found,
   skip that fix and report it as "Could not apply — code changed since review"
5. Use the Edit tool to apply changes. Be precise — change only what the fix requires.
6. Report what was changed for each finding.
```

After all sub-agents return, collect results — which fixes were applied, which were skipped.

### Step 4: Run Tests

After ALL fixes are applied:

```bash
npm test
```

- If tests **pass**: Continue to Step 5.
- If tests **fail**:
  1. Report which tests failed
  2. Identify which fix likely caused the failure (by file/module)
  3. Revert that specific fix
  4. Re-run tests to confirm revert fixes it
  5. Mark that finding as "Fix requires manual intervention — broke tests"
  6. Continue with remaining passing fixes

### Step 5: Update Review Artifact

Update `.claude/specs/<BRANCH_NAME>/review.md`:

- Mark each applied fix as `FIXED` in the findings table
- Mark skipped/reverted fixes as `SKIPPED` or `MANUAL` with reason
- Add a "Heal Summary" section at the bottom:

```markdown
## Heal Summary

**Date**: YYYY-MM-DD
**Applied**: N fixes
**Skipped**: N fixes
**Reverted**: N fixes (broke tests)

| # | Rule | Status | Notes |
|---|------|--------|-------|
| 1 | ES04 | FIXED | Applied successfully |
| 2 | RT03 | MANUAL | Fix broke TaskRow.test.ts |
```

### Step 6: Report Completion

```markdown
## Heal Complete

**Applied**: N of N fixes
**Tests**: ✓ Passing (or list failures)

Remaining findings (MEDIUM/LOW — optional to fix):
- ...

Run `/speckit.conclude` or `/speckit.review`.
```

If any CRITICAL findings remain unfixed (MANUAL status): WARN — "CRITICAL findings remain. Run `/speckit.review` to re-assess."

## Scope Rules

- **CRITICAL and HIGH only** — MEDIUM and LOW are informational, not auto-fixed
- **NEEDS_REFACTOR never** — these are architectural and tracked in refactor-backlog.md
- If user passes arguments like "all" or "medium", extend scope to include those categories
- Each fix is applied independently — one broken fix doesn't block others
- Tests are the safety net — if a fix breaks tests, revert it

## Error Handling

- **No review.md**: Stop. Tell user to run `/speckit.review` first.
- **No CRITICAL/HIGH findings**: Nothing to do. Suggest `/speckit.conclude`.
- **File changed since review**: Skip that fix, note it.
- **Fix breaks tests**: Revert, mark as manual, continue.
- **All fixes fail**: Report all as manual. User must fix by hand.
