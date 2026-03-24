# Implementation Plan: Spec Board

**Branch**: `002-spec-board` | **Date**: 2026-03-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-spec-board/spec.md`

## Summary

Spec Board is a local web dashboard that visualizes speckit artifacts from registered project directories. It reads the currently checked-out branch's speckit files from each registered project, parses markdown into structured data, and renders phase-adaptive views with inline annotation and structured field editing. Comments are written as files back into the speckit directory for Claude to discover. Live updates are pushed via WebSocket when files change on disk.

## Technical Context

**Language/Version**: TypeScript 5.x (shared across main process and renderer)
**Primary Dependencies**: Electron (desktop shell), React 19 (renderer UI), electron-vite (build tooling), chokidar (file watching), unified/remark (markdown parsing)
**Storage**: Filesystem only — speckit files read/written directly, config persisted in `~/.spec-board/config.json`
**Testing**: Vitest (unit + integration)
**Target Platform**: Local development machine (Windows, macOS, Linux) — native Electron desktop app
**Project Type**: Electron desktop application (main process + React renderer via IPC)
**Performance Goals**: Board loads in <2s, file change reflected in UI within 5s, artifact parsing <500ms per file
**Constraints**: Single user, local only, no auth needed, no database, must handle 20+ registered projects
**Scale/Scope**: Up to 20 registered projects, each with one active feature; speckit files typically <500KB each

## Constitution Check

*No constitution file found. Skipping gate checks.*

## Project Structure

### Documentation (this feature)

```text
specs/002-spec-board/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── main/                          # Electron main process
│   ├── index.ts                   # App lifecycle, window creation
│   ├── ipc/
│   │   └── handlers.ts           # IPC handlers (replaces HTTP routes)
│   ├── config/
│   │   └── config-manager.ts     # Read/write ~/.spec-board/config.json
│   ├── projects/
│   │   ├── project-scanner.ts    # Detect checked-out branch, find speckit dir
│   │   └── file-watcher.ts       # chokidar watcher, change event aggregation
│   ├── parser/
│   │   ├── markdown-parser.ts    # unified/remark AST parsing
│   │   ├── spec-parser.ts        # spec.md → structured spec data
│   │   ├── plan-parser.ts        # plan.md → structured plan data
│   │   ├── tasks-parser.ts       # tasks.md → structured task data
│   │   ├── research-parser.ts    # research.md → structured decisions data
│   │   └── comment-parser.ts     # comments/*.md → structured comments
│   ├── writer/
│   │   ├── comment-writer.ts     # Write per-artifact comment files
│   │   ├── artifact-writer.ts    # Write structured field edits back to markdown
│   │   └── markdown-serializer.ts # Positional string splicing for edits
│   └── phase/
│       └── phase-detector.ts     # Infer phase from artifact presence/content
├── preload/
│   └── index.ts                  # Expose IPC channels to renderer via contextBridge
└── renderer/
    ├── index.html
    └── src/
        ├── main.tsx              # React entry point
        ├── App.tsx               # Sidebar + main content layout
        ├── theme.ts              # Tokyo Night dark theme + phase colors
        ├── components/
        │   ├── board/
        │   │   ├── BoardView.tsx     # Persistent sidebar with project list + native folder picker
        │   │   └── FeatureCard.tsx   # Project item with phase dot
        │   ├── feature/
        │   │   ├── FeatureDetail.tsx # Phase-adaptive detail container
        │   │   ├── PhaseHero.tsx     # Renders hero content per phase
        │   │   └── ArtifactTabs.tsx  # Secondary artifact navigation
        │   ├── artifacts/
        │   │   ├── SpecView.tsx      # User stories, requirements, criteria
        │   │   ├── PlanView.tsx      # Design decisions, tech context
        │   │   ├── TasksView.tsx     # Grouped tasks with progress
        │   │   └── ResearchView.tsx  # Research decisions
        │   ├── elements/
        │   │   ├── UserStoryCard.tsx
        │   │   ├── RequirementRow.tsx
        │   │   ├── TaskRow.tsx
        │   │   ├── DecisionSection.tsx
        │   │   └── CommentBadge.tsx
        │   ├── comments/
        │   │   ├── CommentPanel.tsx
        │   │   └── CommentThread.tsx
        │   ├── editing/
        │   │   ├── FieldEditor.tsx
        │   │   ├── StatusDropdown.tsx
        │   │   └── TextEditor.tsx
        │   └── common/
        │       ├── Notification.tsx
        │       └── EmptyState.tsx
        ├── hooks/
        │   ├── useFeatureData.ts
        │   └── useComments.ts
        ├── services/
        │   └── api.ts            # Thin wrapper over window.api (IPC bridge)
        └── types/
            └── index.ts

tests/
├── fixtures/                     # Sample speckit artifacts for parser testing
├── unit/
│   ├── config/
│   ├── projects/
│   ├── parser/
│   ├── writer/
│   └── phase/
└── integration/
```

**Structure Decision**: Electron desktop application. Main process handles filesystem access, git operations, markdown parsing, file watching, and native OS dialogs. Renderer process is a React UI communicating via IPC (contextBridge). No HTTP server, no WebSocket — Electron IPC replaces both. Native folder picker via `dialog.showOpenDialog()`. Single `npm run dev` starts the full app.
