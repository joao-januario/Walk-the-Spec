## Branch Engineering Review

**Branch**: 002-spec-board
**Base**: main
**Files Changed**: 15
**Files Reviewed**: 15 (of 15)
**Verticals**: Electron Main, Renderer (React), Tests

### Summary

| Category | Count |
|----------|-------|
| NEEDS_REFACTOR | 1 |
| CRITICAL | 2 |
| HIGH | 2 |
| MEDIUM | 1 |
| LOW | 1 |

### Findings

| # | Rule | Category | File:Line | Summary | Fix |
|---|------|----------|-----------|---------|-----|
| 1 | ES04 | CRITICAL | src/preload/index.ts:5 | Raw ipcRenderer exposed in onSpecsChanged | Wrap in named function |
| 2 | EA02 | CRITICAL | src/main/ipc/handlers.ts:20 | Uses readFileSync in handler | Switch to fs.promises.readFile |
| 3 | RT03 | HIGH | src/renderer/src/components/feature/FeatureDetail.tsx:42 | Uses any type for elements | Use proper Element[] type |
| 4 | TS04 | HIGH | src/main/parser/spec-parser.ts:65 | Non-null assertion without guard | Add runtime check |
| 5 | RT11 | MEDIUM | src/renderer/src/components/board/BoardView.tsx:1 | Component exceeds 150 lines | Extract sub-components |
| 6 | TT02 | LOW | tests/unit/parser/plan-parser.test.ts:8 | Test name too vague | Use descriptive sentence |
| 7 | EA08 | NEEDS_REFACTOR | src/renderer/src/mockups/board-mockup.tsx:1 | Mockup files import heavy data | Architectural: move mockups out of renderer bundle |

### Proposed Fixes

#### Finding #1: ES04 — Raw ipcRenderer exposed

**File**: src/preload/index.ts:5

**Current:**
```typescript
onSpecsChanged: (cb) => { ipcRenderer.on('specs-changed', cb); }
```

**Proposed:**
```typescript
onSpecsChanged: (cb) => {
  const handler = (_e, ...args) => cb(...args);
  ipcRenderer.on('specs-changed', handler);
  return () => ipcRenderer.removeListener('specs-changed', handler);
}
```

#### Finding #2: EA02 — Sync file read

**File**: src/main/ipc/handlers.ts:20

**Current:**
```typescript
const content = fs.readFileSync(filePath, 'utf-8');
```

**Proposed:**
```typescript
const content = await fs.promises.readFile(filePath, 'utf-8');
```

## Heal Summary

**Date**: 2026-03-24
**Applied**: 2 fixes
**Skipped**: 0 fixes
**Reverted**: 1 fixes (broke tests)

| # | Rule | Status | Notes |
|---|------|--------|-------|
| 1 | ES04 | FIXED | Applied successfully |
| 2 | EA02 | FIXED | Applied successfully |
| 3 | RT03 | MANUAL | Fix broke FeatureDetail.test.ts |
| 4 | TS04 | FIXED | Applied successfully |
