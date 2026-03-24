## Branch Engineering Review

**Branch**: 003-test-feature
**Base**: main
**Files Changed**: 5
**Files Reviewed**: 5 (of 5)
**Verticals**: Renderer (React), Tests

### Summary

| Category | Count |
|----------|-------|
| CRITICAL | 1 |
| HIGH | 1 |
| MEDIUM | 1 |

### Findings

#### Finding #1: ES04 — Raw ipcRenderer exposed in preload

**Severity**: CRITICAL
**Location**: src/preload/index.ts:5
**Rule**: ES04

**Why this severity**: Exposing raw ipcRenderer gives the renderer process direct access to all IPC channels, bypassing the contextBridge security boundary. A compromised renderer could send arbitrary IPC messages to the main process.

**What you gain**: Wrapping in named functions restricts the renderer to only the specific channels you explicitly expose, maintaining the security boundary.

```typescript
// Current (problematic)
onSpecsChanged: (cb) => { ipcRenderer.on('specs-changed', cb); }
```

```typescript
// Proposed fix
onSpecsChanged: (cb) => {
  const handler = (_e, ...args) => cb(...args);
  ipcRenderer.on('specs-changed', handler);
  return () => ipcRenderer.removeListener('specs-changed', handler);
}
```

#### Finding #2: RT03 — Uses any type for callback

**Severity**: HIGH
**Location**: src/renderer/src/App.tsx:39
**Rule**: RT03

**Why this severity**: Using `any` defeats TypeScript's type system. Callbacks with `any` parameters silently accept wrong data shapes, causing runtime errors that the compiler could catch.

**What you gain**: Proper typing catches data shape mismatches at compile time rather than runtime.

#### Finding #3: TT02 — Test name too vague

**Severity**: MEDIUM
**Location**: tests/unit/parser/plan-parser.test.ts:8
**Rule**: TT02

**Why this severity**: Vague test names like `it('works')` provide no documentation value. When a test fails, the name should describe what behavior broke.

**What you gain**: Descriptive test names serve as living documentation and make CI failure messages immediately actionable.

```typescript
// Current
it('works', () => { ... })
```

```typescript
// Proposed
it('extracts summary from plan markdown', () => { ... })
```
