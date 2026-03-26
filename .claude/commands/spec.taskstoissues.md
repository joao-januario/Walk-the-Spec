---
description: Convert plan artifacts and user stories into actionable, dependency-ordered GitHub issues for the feature based on available design artifacts.
model: haiku
tools: ['github/github-mcp-server/issue_write']
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

**Status Signal**: Run `bash .claude/specify/scripts/bash/bootstrap-phase.sh --command "spec.taskstoissues" --phase taskstoissues --json` to signal command start.

## Outline

1. Run `bash .claude/specify/scripts/bash/check-prerequisites.sh --json` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS list. All paths must be absolute. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").
1. From the executed script, extract the paths to **plan.md** and **spec.md**.
1. Get the Git remote by running:

```bash
git config --get remote.origin.url
```

> [!CAUTION]
> ONLY PROCEED TO NEXT STEPS IF THE REMOTE IS A GITHUB URL

1. Parse plan.md for project structure (phases, components, architecture decisions) and spec.md for user stories and functional requirements. Derive actionable, dependency-ordered implementation items from these artifacts.
1. For each derived implementation item, use the GitHub MCP server to create a new issue in the repository that is representative of the Git remote. Each issue should include relevant context from the plan's architecture and the spec's user stories/requirements.

> [!CAUTION]
> UNDER NO CIRCUMSTANCES EVER CREATE ISSUES IN REPOSITORIES THAT DO NOT MATCH THE REMOTE URL

**Status Signal**: Run `bash .claude/specify/scripts/bash/teardown-phase.sh --command "spec.taskstoissues" --json` to signal command completion.
