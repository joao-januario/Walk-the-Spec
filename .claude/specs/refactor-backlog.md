# Refactor Backlog

Architectural debt discovered during branch reviews. Each entry is out of scope for the branch that found it but needs to be addressed in a dedicated refactoring effort.

| ID | Branch | Rule | File(s) | Description | Status |
|----|--------|------|---------|-------------|--------|
| RO-001 | 003-review-heal-tracking | EA02 | src/main/ipc/handlers.ts | All IPC handlers use sync fs operations (readFileSync, existsSync, statSync) blocking the event loop. Migrate all handlers to async fs.promises. | Open |
| RO-002 | 003-review-heal-tracking | ES06 | src/main/ipc/handlers.ts | No argument validation on any IPC handler. Renderer is untrusted — all string args used in file paths need validation. | Open |
