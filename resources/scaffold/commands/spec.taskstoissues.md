---
description: Convert plan artifacts and user stories into actionable, dependency-ordered GitHub issues for the feature based on available design artifacts.
tools: ['github/github-mcp-server/issue_write']
---

## User Input

```text
$ARGUMENTS
```

Consider user input before proceeding.

**Status Signal**: Run `bash .claude/specify/scripts/bash/bootstrap-phase.sh --command "spec.taskstoissues" --phase taskstoissues --json` to signal command start.

## Outline

1. Run `bash .claude/specify/scripts/bash/check-prerequisites.sh --json` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS list (all paths must be absolute). Extract paths to **plan.md** and **spec.md**.
1. Get the Git remote: `git config --get remote.origin.url`

> [!CAUTION]
> ONLY PROCEED IF THE REMOTE IS A GITHUB URL

1. Parse plan.md for project structure (phases, components, architecture decisions) and spec.md for user stories and functional requirements. Derive actionable, dependency-ordered implementation items.
1. For each item, use the GitHub MCP server to create a new issue in the repository matching the Git remote. Include relevant plan architecture context and spec user stories/requirements.

> [!CAUTION]
> NEVER CREATE ISSUES IN REPOSITORIES THAT DO NOT MATCH THE REMOTE URL

**Status Signal**: Run `bash .claude/specify/scripts/bash/teardown-phase.sh --command "spec.taskstoissues" --json` to signal command completion.
