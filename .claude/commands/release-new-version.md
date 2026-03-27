---
description: Bump version, commit, tag, and push to trigger a GitHub Release build.
---

## User Input

```text
$ARGUMENTS
```

## Release New Version

This command automates the release flow: bump version in package.json, commit, create a git tag, and push — which triggers the GitHub Actions CI to build and publish platform installers.

### Execution Steps

1. **Parse version bump type** from user input (`$ARGUMENTS`):
   - If user provides an explicit version (e.g., `1.2.0`), use it directly
   - If user says `patch`, `minor`, or `major`, calculate the next version from the current one in `package.json`
   - If no input provided, default to `patch`

2. **Pre-flight checks** (abort with clear message if any fail):
   - Confirm on `main` branch: `git branch --show-current`
   - Confirm working tree is clean: `git status --porcelain` (must be empty)
   - Confirm up-to-date with remote: `git fetch origin main && git diff origin/main --quiet`

3. **Read current version** from `package.json` using the Read tool.

4. **Calculate new version**:
   - For `patch`: increment the third number (1.2.3 → 1.2.4)
   - For `minor`: increment the second number, reset third (1.2.3 → 1.3.0)
   - For `major`: increment the first number, reset others (1.2.3 → 2.0.0)
   - For explicit version: validate it's valid semver and greater than current

5. **Show the user what will happen** before proceeding:
   ```
   Version: {current} → {new}
   Tag: v{new}
   This will push to main and trigger a GitHub Release build.
   ```
   Ask the user to confirm before continuing.

6. **Execute the release** (only after user confirms):
   - Update `version` field in `package.json` using the Edit tool
   - Stage: `git add package.json`
   - Commit: `git commit -m "release: v{new}"`
   - Tag: `git tag v{new}`
   - Push commit and tag: `git push && git push --tags`

7. **Report success** with a link to the GitHub Actions workflow:
   ```
   Released v{new}
   CI building at: https://github.com/joao-januario/Walk-the-Spec/actions
   Releases page: https://github.com/joao-januario/Walk-the-Spec/releases
   ```
