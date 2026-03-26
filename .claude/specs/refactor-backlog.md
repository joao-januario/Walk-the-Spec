# Refactor Backlog

Architectural debt discovered during branch reviews. Each entry is out of scope for the branch that found it but needs to be addressed in a dedicated refactoring effort.

| ID | Branch | Rule | File(s) | Description | Status |
|----|--------|------|---------|-------------|--------|
| RO-001 | 003-review-heal-tracking | EA02 | src/main/ipc/handlers.ts | All IPC handlers use sync fs operations (readFileSync, existsSync, statSync) blocking the event loop. Migrate all handlers to async fs.promises. | Open |
| RO-002 | 003-review-heal-tracking | ES06 | src/main/ipc/handlers.ts | No argument validation on any IPC handler. Renderer is untrusted — all string args used in file paths need validation. | Open |
| RO-003 | 003-ui-delight-polish | RT10 | PlanView.tsx, DecisionSection.tsx | Duplicate InlineMarkdown/RichText components. Extract to shared src/renderer/src/lib/markdown.tsx. | Open |
| RO-004 | 004-plan-tab-diagrams | TS13-14 | src/**/*.ts | Replace raw equality checks (`x.type === '...'`, `x.status === '...'`) with named predicate functions that express intent, and apply Law of Demeter by wrapping deep property chains (`a.b.c.d`) behind named accessors. Audit entire `src/` tree — parsers, IPC handlers, components, hooks. plan-parser.ts is the reference example. | Open |
