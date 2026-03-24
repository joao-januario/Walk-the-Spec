---
description: Finalize the current feature branch — run tests, clean up branch-specific artifacts, commit, squash merge to main.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Goal

Conclude the current feature branch by validating tests pass, cleaning up branch-specific speckit artifacts, committing all work, and squash-merging to main. This is the final step after `/speckit.implement` (and optionally `/speckit.review-branch`).

## Execution Steps

### Step 1: Verify Branch State

```bash
git rev-parse --abbrev-ref HEAD
```

- If on `main`: ERROR — "You are already on main. Switch to a feature branch first."
- Extract **BRANCH_NAME** from the current branch.
- Extract **FEATURE_DIR** as `.claude/specs/<BRANCH_NAME>/`
- Verify FEATURE_DIR exists. If not, WARN — "No speckit artifacts found for this branch."

### Step 2: Run Tests

Run the project's test suite:

```bash
npm test
```

- If tests **fail**: STOP. Report failures. Say: "Tests must pass before concluding. Fix the failing tests and try again."
- If tests **pass**: Continue.

### Step 3: Show Summary

Before doing anything destructive, show the user what will happen:

```markdown
## Conclude: BRANCH_NAME

**Tests**: ✓ All passing
**Branch artifacts to delete**: list each file in FEATURE_DIR
**Merge strategy**: Squash merge to main

Proceed? (yes/no)
```

Wait for user confirmation before continuing. If user says no, stop.

### Step 4: Stage All Current Work

Stage all changes that represent the feature work:

```bash
git add -A
```

Review what's staged. If there are files that look like they shouldn't be committed (`.env`, credentials, large binaries), warn the user before proceeding.

### Step 5: Delete Branch-Specific Artifacts

Delete the entire feature spec directory:

```bash
rm -rf .claude/specs/<BRANCH_NAME>/
```

This removes:
- spec.md
- plan.md
- tasks.md
- research.md
- data-model.md
- quickstart.md
- contracts/
- checklists/
- Any other files created under the branch directory

**Do NOT delete**:
- `.claude/specs/refactor-backlog.md` (project-level)
- `.claude/best-practices/` (project-level)
- `.claude/specify/` (tooling)
- `.claude/commands/` (skills)
- `.claude/projects/` (memory)
- `CLAUDE.md` (project guidelines)
- Any other branch's spec directories

Stage the deletions:

```bash
git add -A
```

### Step 6: Commit

Create a single commit with all work + artifact cleanup:

```bash
git commit -m "<commit message>"
```

Commit message format:
```
feat: <concise summary of what the feature does>

<2-3 bullet points of key capabilities>

Branch: <BRANCH_NAME>
Artifacts cleaned up: .claude/specs/<BRANCH_NAME>/

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
```

Use a HEREDOC for the message to preserve formatting.

### Step 7: Squash Merge to Main

```bash
git checkout main
git merge --squash <BRANCH_NAME>
git commit -m "<same commit message as step 6>"
```

If there are merge conflicts:
- STOP and report the conflicts to the user
- Do NOT attempt to resolve them automatically
- Say: "Merge conflicts detected. Resolve them manually, then run `/speckit.conclude` again."

### Step 8: Clean Up Branch

After successful merge:

```bash
git branch -d <BRANCH_NAME>
```

### Step 9: Report Completion

```markdown
## Feature Concluded

**Branch**: BRANCH_NAME (deleted)
**Merged to**: main (squash)
**Commit**: <short hash>
**Tests**: ✓ Passing
**Artifacts cleaned**: .claude/specs/BRANCH_NAME/ removed

The feature is now on main. You can start a new feature with `/speckit.specify`.
```

## Error Handling

- **Tests fail**: Stop immediately. Do not commit or merge.
- **Merge conflicts**: Stop. Report conflicts. User resolves manually.
- **No feature directory**: Warn but allow conclude (the feature may not have used speckit).
- **Uncommitted changes on main**: Stop. User must stash or commit main changes first.
- **User cancels**: Stop. No changes made.

## Safety Rules

- ALWAYS show the user what will be deleted before deleting
- ALWAYS wait for confirmation before destructive operations
- NEVER force-push
- NEVER delete other branches' spec directories
- NEVER delete project-level files (refactor-backlog, best-practices, constitution, memory)
- Run tests BEFORE any commits
