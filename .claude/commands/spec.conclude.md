---
description: Finalize the current feature branch — run tests, clean up branch-specific artifacts, commit, squash merge to main.
model: haiku
---

## User Input

```text
$ARGUMENTS
```

Consider user input before proceeding.

**Status Signal**: Run `bash .claude/specify/scripts/bash/bootstrap-phase.sh --command "spec.conclude" --phase conclude --json` to signal command start.

## Goal

Conclude the current feature branch: validate tests, clean up branch spec artifacts, commit, squash-merge to main. Final step after `/spec.implement` (and optionally `/spec.review`).

## Execution Steps

### Step 1: Verify Branch State

Run `git rev-parse --abbrev-ref HEAD`. If on `main`: ERROR. Extract BRANCH_NAME, derive FEATURE_DIR as `.claude/specs/<BRANCH_NAME>/`. Verify FEATURE_DIR exists (WARN if not).

### Step 2: Build & Test

```bash
npm run build
npm test
```

Build fails → STOP, report errors. Tests fail → STOP, report failures. Both pass → continue.

### Step 3: Update Documentation

If the project's agent context file has a Documentation section with coverage mappings:
1. `git diff main --name-only` to see changed files
2. Cross-reference against CLAUDE.md Documentation table (single source of truth for doc coverage)
3. Update only specific sections affected in matching docs
4. Verify Documentation and Context Routing tables still accurate
5. No documentation table or no documented areas touched → "No doc changes needed"

**Rules**: Only update affected sections. CLAUDE.md owns the index. Doc files contain deep technical content only — reference source files inline in prose.

### Step 4: Proceed

Tests passed, docs updated — proceed immediately. No confirmation needed.

### Step 5: Stage All Current Work

`git add -A` — review staged files. Warn if `.env`, credentials, or large binaries are staged.

### Step 6: Delete Branch-Specific Artifacts

```bash
rm -rf .claude/specs/<BRANCH_NAME>/
git add -A
```

**Do NOT delete**: `.claude/specs/refactor-backlog.md`, `.claude/best-practices/`, `.claude/specify/`, `.claude/commands/`, `.claude/projects/`, `CLAUDE.md`, or other branches' directories.

### Step 7: Commit

Single commit with all work + artifact cleanup. Format:
```
feat: <concise feature summary>

<2-3 bullet points of key capabilities>

Branch: <BRANCH_NAME>
Artifacts cleaned up: .claude/specs/<BRANCH_NAME>/

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
```
Use HEREDOC for message formatting.

### Step 8: Squash Merge to Main

```bash
git checkout main && git merge --squash <BRANCH_NAME> && git commit -m "<same message>"
```

Chain in single Bash call. Merge conflicts → STOP, report, user resolves manually.

### Step 9: Clean Up Branch

`git branch -d <BRANCH_NAME>`

### Step 10: Report Completion

```markdown
## Feature Concluded

**Branch**: BRANCH_NAME (deleted)
**Merged to**: main (squash)
**Commit**: <short hash>
**Tests**: ✓ Passing
**Artifacts cleaned**: .claude/specs/BRANCH_NAME/ removed

The feature is now on main. You can start a new feature with `/spec.specify`.
```

## Error Handling

| Condition | Action |
|-----------|--------|
| Tests fail | Stop immediately, do not commit/merge |
| Merge conflicts | Stop, report, user resolves manually |
| No feature directory | Warn but allow conclude |
| Uncommitted changes on main | Stop, user must stash/commit first |

**Status Signal**: Run `bash .claude/specify/scripts/bash/teardown-phase.sh --command "spec.conclude" --json` to signal command completion.

## Safety Rules

- ALWAYS show what will be deleted before deleting
- ALWAYS wait for confirmation before destructive operations
- NEVER force-push, delete other branches' specs, or delete project-level files
- Run build + tests BEFORE any commits
