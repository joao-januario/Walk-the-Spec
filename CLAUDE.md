# walk-the-spec Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-26

## Active Technologies
- TypeScript 5.x (existing) + Electron, React 19, unified/remark, chokidar (all existing — no new deps) (003-review-heal-tracking)
- Filesystem only (review.md per branch, refactor-backlog.md per project) (003-review-heal-tracking)
- TypeScript 5.x (existing) + Tailwind CSS v4, @tailwindcss/vite (new). Electron, React 19, electron-vite (existing) (003-tailwind-migration)
- N/A (styling refactor) (003-tailwind-migration)

- TypeScript 5.x (shared across main process and renderer) + Electron (desktop shell), React 19 (renderer UI), electron-vite (build tooling), chokidar (file watching), unified/remark (markdown parsing) (002-spec-board)

## Project Structure

```text
src/main/       # Electron main process (IPC handlers, parsers, filesystem)
src/preload/    # Preload script (contextBridge IPC exposure)
src/renderer/   # React UI (components, hooks, services)
tests/          # Vitest unit + integration tests
```

## Commands

npm test; npm run dev; npm run build

## Code Style

TypeScript 5.x: Follow standard conventions. Dark Radix Mauve theme for UI (accessibility-tested).

## Design Principles

- No wasted space — every pixel should serve a purpose
- Colorful dark theme — fun and easy on the eyes for night sessions
- Persistent project sidebar — all projects visible at all times with phase status
- 1-click project switching — sidebar is always visible regardless of view
- Native OS integration — folder picker, window management via Electron

## Recent Changes
- 004-walk-the-spec-rebrand: Added Electron
- 004-radix-mauve-theme: Added react-markdown, @tailwindcss/typography (new). @radix-ui/colors for color tokens. Existing stack unchanged.
- 003-tailwind-migration: Added TypeScript 5.x (existing) + Tailwind CSS v4, @tailwindcss/vite (new). Electron, React 19, electron-vite (existing)


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
