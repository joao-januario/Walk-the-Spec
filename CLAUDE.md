# walk-the-spec Development Guidelines

Electron desktop app that monitors local projects for speckit artifacts (`.claude/specs/<branch>/*.md`) and renders them as an interactive dashboard.

## Architecture

Two-process Electron app: main process (filesystem, parsing, IPC) + renderer (React 19 SPA).

```text
src/main/          # Electron main process — IPC handlers, 8 parsers, file watchers, notifications
src/preload/       # contextBridge — thin IPC bridge (no business logic)
src/renderer/      # React 19 SPA — components, hooks, services
tests/             # Vitest unit + integration tests
```

**Data flow**: File change → chokidar (300ms debounce) → IPC event → React re-render → hooks fetch via IPC → parsers extract elements → components render.

## Context Routing Table

Read the right doc for your task — don't read all source files.

| Workflow | Read first | Also read if needed |
|----------|-----------|-------------------|
| New feature / general orientation | `docs/architecture.md` | — |
| `/spec.review` or code review | `docs/architecture.md` | Area guide for files under review |
| Add/modify parser | `docs/parsers.md` | `docs/ipc.md` (to register handler) |
| Add/modify IPC channel | `docs/ipc.md` | — |
| Add/modify UI component / theme | `docs/renderer.md` | `docs/ipc.md` (if new data needed) |
| Modify artifact editing | `docs/writer.md` | `docs/ipc.md` (edit-field handler) |
| Modify file watching / phase detection / notifications / settings | `docs/architecture.md` (inline sections) | — |
| Modify scaffold / integration / auto-update | `docs/architecture.md` | — |

## Context & Navigation

Before exploring source code, read `.claude/specify/context/repo-map.md` for the structural map of all files (exports, imports, hashes). Use Grep for targeted searches — do not read entire directories to "discover" the codebase. Full protocol: `.claude/specify/templates/context-protocol.md`.

## Documentation

This table is the **single source of truth** for file-to-doc coverage. Do not duplicate this mapping in doc files.

| File | Covers source paths |
|------|---------------------|
| `docs/architecture.md` | `src/main/index.ts`, `src/main/projects/`, `src/main/phase/`, `src/main/notifications/`, `src/main/repomap/`, `src/main/integration/`, `src/main/updater/`, `src/preload/`, `resources/scaffold/`, `scripts/`, `.github/workflows/` |
| `docs/parsers.md` | `src/main/parser/` |
| `docs/ipc.md` | `src/main/ipc/`, `src/preload/index.ts`, `src/renderer/src/services/api.ts` |
| `docs/renderer.md` | `src/renderer/src/components/`, `src/renderer/src/hooks/`, `src/renderer/src/themes/` |
| `docs/writer.md` | `src/main/writer/` |

**Doc rules**: CLAUDE.md owns the index (what covers what). Doc files contain only deep technical content — no "Key Files" tables, no file listings, no app descriptions that repeat this file. Reference source files inline in prose, not in summary tables.

## Tech Stack

TypeScript 5.x, Electron, React 19, electron-vite, Tailwind CSS v4, chokidar (file watching), unified/remark (markdown parsing), Vitest (testing).

## Commands

```
npm run dev      # Start dev server (electron-vite)
npm run build    # Production build
npm test         # Run Vitest tests
```

## Code Style

TypeScript strict mode. Dark Radix Mauve theme (accessibility-tested). See `.claude/specify/memory/constitution.md` for full engineering standards.

## Design Principles

- No wasted space — every pixel serves a purpose
- Colorful dark theme — easy on eyes for night sessions
- Persistent project sidebar — always visible with phase status
- 1-click project switching
- Native OS integration (folder picker, window management)

## Scaffold Sync

`.claude/commands/`, `.claude/specify/templates/`, and `.claude/specify/scripts/` are the **source of truth** for speckit files. `resources/scaffold/` is a bundled copy that gets distributed to other projects during integration ("Refresh Specs"). The sync is automatic — `npm run build` runs `scripts/sync-scaffold.sh` before compiling.

**Not synced** (scaffold-only, intentionally different from live files):
- `resources/scaffold/best-practices/` — generic templates replaced by `/spec.constitution` per project
- `resources/scaffold/CLAUDE.md.template` — template for new projects, not a copy of this file
- `resources/scaffold/.scaffold-version` — bump manually when scaffold content changes

If you edit any file in `.claude/commands/`, `.claude/specify/templates/`, or `.claude/specify/scripts/`, the next `npm run build` automatically propagates it to `resources/scaffold/`. Project-specific commands (e.g., `release-new-version.md`) are excluded via the `EXCLUDE_FILES` list in `scripts/sync-scaffold.sh`. Run `npm run sync-scaffold:check` to verify sync without modifying files.

## Context & Navigation

Before exploring source code, read `.claude/specify/context/repo-map.md` for the structural map of all files (exports, imports, hashes). Use Grep for targeted searches — do not read entire directories to "discover" the codebase. Full protocol: `.claude/specify/templates/context-protocol.md`.
