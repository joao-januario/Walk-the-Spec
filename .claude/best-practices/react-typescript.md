# React + TypeScript Best Practices

Rules for React 19 components, hooks, state management, and TypeScript integration.
Applies to: `src/renderer/**/*.tsx`, `src/renderer/**/*.ts`

---

## RT01 — Function Components Only

**Severity**: HIGH
**Rule**: MUST use function components exclusively. No class components except error boundaries (React limitation).

**Detect**: Flag any `class ... extends React.Component` that is not an error boundary (no `getDerivedStateFromError` or `componentDidCatch`).

---

## RT02 — Rules of Hooks

**Severity**: CRITICAL
**Rule**: Hooks MUST only be called at the top level of function components or custom hooks. MUST NOT be called inside conditions, loops, or nested functions.

**Detect**: Flag any hook call (`use*`) inside an `if`, `for`, `while`, or nested function body.

---

## RT03 — No `any` Type

**Severity**: HIGH
**Rule**: MUST NOT use `any` in production code. Use `unknown` with type guards when the type is truly unknown.

**Detect**: Search for `: any`, `as any`, `<any>` in all `.ts` and `.tsx` files. Flag each occurrence.

**Exception**: `any` is acceptable in test files (`*.test.ts`) for mocking purposes only.

```ts
// WRONG
function parseData(input: any) { return input.name; }

// CORRECT
function parseData(input: unknown): string {
  if (typeof input === 'object' && input !== null && 'name' in input) {
    return (input as { name: string }).name;
  }
  throw new Error('Invalid input');
}
```

---

## RT04 — Discriminated Unions for Variants

**Severity**: HIGH
**Rule**: MUST use discriminated unions with a literal `type` or `kind` field for content that can take multiple shapes. MUST use exhaustive switch with `default: assertNever(x)`.

**Detect**: Flag `if/else` chains checking `content.type` without a default/exhaustive case. Flag union types that lack a discriminant field.

```ts
// WRONG
if (element.type === 'user-story') { ... }
else if (element.type === 'requirement') { ... }
// missing other cases silently

// CORRECT
switch (element.type) {
  case 'user-story': return renderStory(element);
  case 'requirement': return renderReq(element);
  default: assertNever(element);
}
```

---

## RT05 — Explicit Return Types on Custom Hooks

**Severity**: MEDIUM
**Rule**: Custom hooks MUST have explicit return types to prevent accidental API changes.

**Detect**: Flag exported `function use*()` declarations without a return type annotation.

```ts
// WRONG
export function useFeatureData(id: string) { ... }

// CORRECT
export function useFeatureData(id: string): {
  feature: Feature | null;
  loading: boolean;
  error: string | null;
} { ... }
```

---

## RT06 — Stable Keys on Lists

**Severity**: HIGH
**Rule**: MUST provide stable, unique `key` props on list items. MUST NOT use array indices for lists that can be reordered, filtered, or mutated.

**Detect**: Flag `.map((item, index) => <... key={index} ...>)` patterns.

---

## RT07 — Error Boundaries Per Section

**Severity**: HIGH
**Rule**: MUST wrap every distinct UI section (sidebar, main panel, detail views) in its own error boundary so failure in one doesn't crash the whole app.

**Detect**: Check top-level layout. Flag if the app has a single error boundary or none at all.

---

## RT08 — Async Error Handling

**Severity**: HIGH
**Rule**: MUST handle async errors in event handlers with try/catch — error boundaries don't catch these.

**Detect**: Flag `async` event handlers (onClick, onSubmit, etc.) without try/catch.

```ts
// WRONG
const handleSave = async () => {
  await saveData(data); // unhandled rejection if fails
};

// CORRECT
const handleSave = async () => {
  try {
    await saveData(data);
  } catch (err: unknown) {
    setError(err instanceof Error ? err.message : 'Save failed');
  }
};
```

---

## RT09 — No Derived State in useState

**Severity**: MEDIUM
**Rule**: MUST NOT store derived data in state. Compute during render or with `useMemo`.

**Detect**: Flag `useState` calls where the initial value is computed from another state variable or prop, and a `useEffect` syncs them.

```ts
// WRONG
const [filtered, setFiltered] = useState(items.filter(predicate));
useEffect(() => setFiltered(items.filter(predicate)), [items]);

// CORRECT
const filtered = useMemo(() => items.filter(predicate), [items]);
```

---

## RT10 — No Business Logic in Components

**Severity**: MEDIUM
**Rule**: Components MUST NOT contain business logic. Extract to pure functions (utils) or custom hooks.

**Detect**: Flag components over 150 lines. Flag components that contain data transformation, parsing, or complex conditional logic beyond simple UI branching.

---

## RT11 — Component Size Limit

**Severity**: LOW
**Rule**: Components SHOULD stay under 150 lines. Extract hooks for logic and sub-components for rendering when exceeding this.

**Detect**: Flag any `.tsx` component file exceeding 200 lines.

---

## RT12 — Typed Event Handlers

**Severity**: LOW
**Rule**: SHOULD explicitly type event handlers defined outside JSX.

**Detect**: Flag event handler functions assigned to variables without type annotation when they use `e.target` or `e.currentTarget`.

---

## RT13 — Use `satisfies` Over `as`

**Severity**: MEDIUM
**Rule**: SHOULD use `satisfies` for compile-time validation without type widening. MUST NOT use `as` for type assertions in production code except at validated trust boundaries with a justifying comment.

**Detect**: Flag `as` assertions that aren't `as const` or at JSON parse boundaries. Flag `as` without a comment.

---

## RT14 — Split Context by Update Frequency

**Severity**: MEDIUM
**Rule**: SHOULD split React context by update frequency. Don't combine fast-changing values (selections, cursors) with slow-changing values (theme, config) in the same context.

**Detect**: Flag context providers that contain both frequently-updated state and rarely-updated state.
