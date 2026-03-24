# Spec Board

## Feature Description

Spec-board is a lightweight, read-only web dashboard that visualizes speckit artifacts across active git branches in a registered project. It provides structured, Jira-like views of specs, plans, tasks, and research — with drill-down navigation and inline annotation. Comments/edits are sent back to Claude CLI for processing. No orchestration, no session management, no Claude process hosting — it just watches and renders.

## Core Concepts

- **Project tracking:** Register one or more local project paths. Spec-board watches their `.claude/specs/` directories and git branches.
- **Branch = Feature:** Each git branch with speckit artifacts appears as a feature card on the board. Active branches show up, merged/deleted branches disappear. No history tracking.
- **Structured artifact views:** Artifacts are parsed into structured data and rendered as navigable UI (not raw markdown). User stories as cards, tasks as grouped lists, decisions as expandable sections, etc.
- **Annotation & comments:** Users can annotate any element (user story, task, decision, section) with inline comments. Comments are collected and can be sent back to Claude CLI for review/application.
- **Read-only by default:** Spec-board does not write to speckit files directly. The only write path is "send comments to Claude" which invokes the CLI externally.
- **Live updates:** File watcher detects changes to spec files and git branch state, pushes updates to the UI via WebSocket.

## Key User Flows

1. Register a project → see all active branches with speckit content
2. Click a branch → see its current phase and all artifacts in structured views
3. Drill into a user story → see acceptance criteria, priority, linked tasks
4. Drill into tasks → see by phase, status, dependencies
5. Add comments/annotations to any element
6. Click "Send to Claude" → comments are piped to `claude -p` or copied to clipboard

## What This Is NOT

- Not a Claude process manager (use Claude CLI directly)
- Not a phase orchestrator (speckit skills run in the terminal)
- Not a history/snapshot tracker (branch exists = visible, branch gone = gone)
- Not a terminal replacement (it's a companion viewer)
