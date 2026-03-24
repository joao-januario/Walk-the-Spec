# Refactor Backlog

Architectural debt discovered during branch reviews. Each entry is out of scope for the branch that found it but needs to be addressed in a dedicated refactoring effort.

| ID | Branch | Rule | File(s) | Description | Status |
|----|--------|------|---------|-------------|--------|
| RO-001 | 002-spec-board | EA08 | src/renderer/src/mockups/ | Mockup files are bundled in the renderer build. Should be excluded or moved to a dev-only directory. | Open |
| RO-002 | 002-spec-board | EA02 | src/main/ipc/handlers.ts | Multiple sync file reads in IPC handlers. Should migrate to async fs.promises across all handlers. | Open |
| RO-003 | 003-review-heal-tracking | RT10 | src/renderer/src/components/artifacts/SpecView.tsx | Business logic (comment filtering, stale detection) mixed into component. Extract to hooks/utils. | Open |
