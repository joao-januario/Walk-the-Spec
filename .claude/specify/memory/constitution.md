<!--
Sync Impact Report
Version: 0.0.0 → 1.0.0 (MAJOR — initial ratification)
Added principles: Electron Security, Electron Architecture, React + TypeScript,
                  TypeScript Strictness, Testing Discipline, Performance
Added sections: Design Philosophy, Governance
Templates requiring updates: ⚠ pending (plan-template Constitution Check)
Follow-up TODOs: none
-->

# Spec Board Constitution

## Core Principles

### I. Electron Security

Every renderer is untrusted. The main process is the only trusted boundary.

- **MUST** set `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true` on every BrowserWindow.
- **MUST** expose IPC via preload `contextBridge` with named functions only. MUST NOT expose raw `ipcRenderer`.
- **MUST** use `ipcMain.handle` / `ipcRenderer.invoke` as the primary IPC pattern. MUST NOT use `ipcRenderer.sendSync`.
- **MUST** validate all arguments received in `ipcMain.handle` handlers — the renderer is untrusted.
- **MUST** set a strict CSP on all renderer HTML: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'`. MUST NOT use `'unsafe-eval'`.
- **MUST** namespace IPC channels as `domain:action` (e.g., `spec:read`, `project:add`).
- **MUST NOT** enable `allowRunningInsecureContent`, disable `webSecurity`, or set `nodeIntegration: true`.
- **MUST** validate and sanitize all file paths received via IPC. Verify resolved paths are within allowed base directories.
- **MUST** return cleanup/unsubscribe functions from any `on`-style listener exposed through the preload bridge.
- Preload scripts MUST be thin — bridging only, no business logic.

### II. Electron Architecture

Main process is a backend. Renderer is a browser client. They share no runtime code.

- **MUST** perform all filesystem operations in the main process only. Renderer requests via IPC.
- **MUST** use `fs.promises` (async) for all file operations. MUST NOT use sync variants in production — they block the event loop.
- **MUST** register all `ipcMain.handle` calls in a centralized initialization function called once at startup.
- **MUST** clean up IPC listeners, file watchers, and window references when windows close or app quits.
- **MUST** handle `window-all-closed` (quit on Windows/Linux, keep alive on macOS) and `activate` (re-create window on macOS).
- **SHOULD** defer heavy module imports with dynamic `import()` for modules not needed at startup.
- **SHOULD** show window only on `ready-to-show` event to avoid white flash.
- **SHOULD** use `utilityProcess.fork()` for CPU-intensive background tasks instead of blocking main.
- **SHOULD** scope file watchers to the narrowest possible directory. Debounce change events 100-300ms before sending to renderer.

### III. React + TypeScript

Function components, strict types, composition over complexity.

- **MUST** use function components exclusively. No class components except error boundaries.
- **MUST** follow Rules of Hooks — top level only, never inside conditions/loops.
- **MUST NOT** use `any`. Use `unknown` with type guards when the type is truly unknown.
- **MUST** use discriminated unions with a literal `type` or `kind` field for variant content types. Exhaustive switch with `default: assertNever(x)`.
- **MUST** type custom hooks with explicit return types to prevent accidental API changes.
- **MUST** provide stable, unique `key` props on list items. MUST NOT use array indices for mutable lists.
- **MUST** wrap every distinct UI section (sidebar, main panel) in its own error boundary.
- **MUST** handle async errors in event handlers with try/catch — error boundaries don't catch these.
- **SHOULD** keep components under 150 lines. Extract hooks for logic, sub-components for rendering.
- **SHOULD** use `useReducer` when state transitions are complex or next state depends on previous.
- **SHOULD** split context by update frequency — don't mix fast-changing and slow-changing values.
- **MUST NOT** store derived data in state. Compute during render or with `useMemo`.
- **MUST NOT** put business logic directly in components. Extract to pure functions or custom hooks.
- **SHOULD** use `satisfies` for compile-time validation without type widening.
- **SHOULD** rely on React Compiler for memoization. Manual `useMemo`/`useCallback` only when profiling shows a concrete problem.

### IV. TypeScript Strictness

Strict mode is non-negotiable. The type system is a safety net, not a suggestion.

- **MUST** enable `strict: true` in tsconfig.json.
- **MUST** enable `noUncheckedIndexedAccess: true` — every index returns `T | undefined`.
- **MUST** enable `noFallthroughCasesInSwitch: true`.
- **MUST NOT** use `as any` in production code. Ever.
- **MUST NOT** use non-null assertion (`!`) without a preceding runtime guard and a comment explaining why.
- **MUST** type catch variables as `unknown` and narrow with `instanceof` or type guards.
- **MUST** use `export type` for type-only exports.
- **MUST NOT** create circular module dependencies. Extract shared types to a common ancestor.
- **SHOULD** use a `Result<T, E>` pattern for operations with expected, recoverable failures. Reserve thrown exceptions for truly unrecoverable situations.
- **SHOULD** define error types as discriminated unions, not bare strings or generic Error subclasses.
- **SHOULD** prefer `??` over `||` for default values to avoid falsy-value bugs.
- **SHOULD** use branded types for domain identifiers to prevent accidental interchange.

### V. Testing Discipline

TDD for core logic. Tests are documentation, not an afterthought.

- **MUST** write tests first for core backend modules (parsers, writers, phase detector, config, scanner). Red-green-refactor.
- **MUST NOT** write production code before a failing test exists for the behavior being added.
- **MUST** name `it` blocks as sentences: `it('returns an error when the file does not exist')`. MUST NOT use vague names like `it('works')`.
- **MUST** use `describe` blocks that name the module or function under test.
- **MUST** restore all mocks after each test. MUST NOT share mutable state between `it` blocks.
- **MUST** separate unit tests (single module, deps mocked) from integration tests (multiple real modules).
- **MUST** keep unit tests under 50ms each. If it needs real filesystem/network, it's integration.
- **SHOULD** use factory functions for test data instead of shared mutable fixtures.
- **SHOULD** prefer dependency injection over `vi.mock` where practical.
- **SHOULD** use `vi.spyOn` when observing calls without replacing implementation.
- **MUST NOT** silently swallow errors in catch blocks — every catch must re-throw, return error, or log with context.

### VI. Performance

Don't guess, measure. But don't optimize what doesn't matter.

- **MUST NOT** do CPU-intensive work in the renderer process. Parsing, file reads, and computation stay in main.
- **MUST NOT** store large data (full file contents) in React state if only a derived version is needed.
- **MUST** batch IPC calls where possible. Don't make 20 sequential invoke calls when one can return all data.
- **MUST** always `await` or return every Promise. MUST NOT let promises float un-awaited.
- **MUST** use `Promise.all()` for concurrent independent async operations, not sequential await in a loop.
- **SHOULD** use `React.lazy` + `Suspense` for code-splitting heavy views.
- **SHOULD** debounce user input and file watcher events before triggering re-renders or IPC calls.
- **SHOULD** use `requestIdleCallback` for non-critical updates.

## Design Philosophy

No wasted space. Every pixel serves a purpose.

- **MUST** use the dark Tokyo Night color palette as the base theme. Colorful accents, easy on eyes at night.
- **MUST** maintain a persistent project sidebar visible at all times regardless of current view.
- **MUST** support 1-click project switching — the sidebar is the primary navigation.
- **MUST** use native OS integration where available (folder picker, window management).
- **MUST NOT** add a top bar, header, or chrome that wastes vertical space without adding function.
- **SHOULD** show phase-adaptive hero content — the most relevant info for the current speckit phase front and center.

## Governance

This constitution defines the non-negotiable engineering standards for Spec Board.

- All code reviews MUST verify compliance with these principles.
- Violations MUST be justified with a documented rationale and a comment in the code explaining why.
- Amendments require updating this file, incrementing the version, and propagating changes to dependent templates.
- The `/speckit.analyze` command validates artifacts against these principles.
- Use CLAUDE.md for runtime development guidance that supplements (but does not override) this constitution.

**Version**: 1.0.0 | **Ratified**: 2026-03-24 | **Last Amended**: 2026-03-24
