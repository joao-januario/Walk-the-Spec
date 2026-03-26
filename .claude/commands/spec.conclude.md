---
description: Finalize the current feature branch — run tests, clean up branch-specific artifacts, commit, squash merge to main.
model: haiku
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

**Status Signal**: Run `.claude/specify/scripts/powershell/bootstrap-phase.ps1 -Command "spec.conclude" -Phase conclude -Json` to signal command start.

## Goal

Conclude the current feature branch by validating tests pass, cleaning up branch-specific spec artifacts, committing all work, and squash-merging to main. This is the final step after `/spec.implement` (and optionally `/spec.review`).

## Execution Steps

### Step 1: Verify Branch State

```bash
git rev-parse --abbrev-ref HEAD
```

- If on `main`: ERROR — "You are already on main. Switch to a feature branch first."
- Extract **BRANCH_NAME** from the current branch.
- Extract **FEATURE_DIR** as `.claude/specs/<BRANCH_NAME>/`
- Verify FEATURE_DIR exists. If not, WARN — "No spec artifacts found for this branch."

### Step 2: Build & Test

Run the production build and test suite:

```bash
npm run build
npm test
```

- If **build fails**: STOP. Report errors. Say: "Build must pass before concluding. Fix the compilation errors and try again."
- If **tests fail**: STOP. Report failures. Say: "Tests must pass before concluding. Fix the failing tests and try again."
- If both **pass**: Continue.

### Step 3: Proceed

Tests passed — proceed immediately. No confirmation needed. The user already invoked the command.

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
git checkout main && git merge --squash <BRANCH_NAME> && git commit -m "<same commit message as step 6>"
```

> **Note**: Chain these git operations into a single Bash call (`git checkout main && git merge --squash ... && git commit ...`) so a failure at any step stops the chain.

If there are merge conflicts:
- STOP and report the conflicts to the user
- Do NOT attempt to resolve them automatically
- Say: "Merge conflicts detected. Resolve them manually, then run `/spec.conclude` again."

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

The feature is now on main. You can start a new feature with `/spec.specify`.
```

## Error Handling

- **Tests fail**: Stop immediately. Do not commit or merge.
- **Merge conflicts**: Stop. Report conflicts. User resolves manually.
- **No feature directory**: Warn but allow conclude (the feature may not have used spec commands).
- **Uncommitted changes on main**: Stop. User must stash or commit main changes first.
- **User cancels**: Stop. No changes made.

**Status Signal**: Run `.claude/specify/scripts/powershell/teardown-phase.ps1 -Command "spec.conclude" -Json` to signal command completion.

## Safety Rules

- ALWAYS show the user what will be deleted before deleting
- ALWAYS wait for confirmation before destructive operations
- NEVER force-push
- NEVER delete other branches' spec directories
- NEVER delete project-level files (refactor-backlog, best-practices, constitution, memory)
- Run build + tests BEFORE any commits
