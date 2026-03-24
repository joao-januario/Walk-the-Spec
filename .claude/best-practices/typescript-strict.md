# TypeScript Strictness Best Practices

Rules for TypeScript 5.x strict mode, error handling, module design, and async patterns.
Applies to: all `*.ts` and `*.tsx` files, `tsconfig*.json`

---

## TS01 — Strict Mode Enabled

**Severity**: CRITICAL
**Rule**: tsconfig.json MUST have `"strict": true`.

**Detect**: Read tsconfig.json. Flag if `strict` is missing or `false`.

---

## TS02 — noUncheckedIndexedAccess

**Severity**: HIGH
**Rule**: tsconfig.json MUST have `"noUncheckedIndexedAccess": true`. Every array/object index returns `T | undefined`.

**Detect**: Read tsconfig.json. Flag if missing.

---

## TS03 — No `as any`

**Severity**: CRITICAL
**Rule**: MUST NOT use `as any` in production code. Ever.

**Detect**: Search all non-test `.ts`/`.tsx` files for `as any`. Flag every occurrence.

---

## TS04 — No Unguarded Non-Null Assertion

**Severity**: HIGH
**Rule**: MUST NOT use `!` (non-null assertion) without a preceding runtime guard in the same scope and a comment explaining why.

**Detect**: Search for `!.` and `!)` patterns. Flag if no type narrowing (`if`, `??`, `||`) precedes it on the same or previous line.

```ts
// WRONG
const name = user!.name;

// CORRECT
if (!user) throw new Error('User required');
const name = user.name; // no ! needed after guard
```

---

## TS05 — Unknown in Catch Blocks

**Severity**: HIGH
**Rule**: Catch variables MUST be typed as `unknown` and narrowed before use. MUST NOT assume `err` is `Error`.

**Detect**: Flag `catch (err)` blocks that access `err.message` without prior `instanceof Error` check.

```ts
// WRONG
catch (err) { console.log(err.message); }

// CORRECT
catch (err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  console.log(message);
}
```

---

## TS06 — No Silent Error Swallowing

**Severity**: HIGH
**Rule**: Every `catch` block MUST either re-throw, return an error result, or log with sufficient context. MUST NOT have empty catch blocks.

**Detect**: Flag `catch` blocks with empty body, or body containing only a comment.

```ts
// WRONG
catch (err) { /* ignore */ }
catch (err) {}

// CORRECT
catch (err: unknown) {
  console.error('Failed to parse spec:', err);
  return { ok: false, error: 'Parse failed' };
}
```

---

## TS07 — Export Type for Type-Only Exports

**Severity**: LOW
**Rule**: SHOULD use `export type` for type-only exports to ensure they are erased at compile time.

**Detect**: Flag `export { SomeType }` where `SomeType` is only used as a type (never as a value) — should be `export type { SomeType }`.

---

## TS08 — No Circular Dependencies

**Severity**: HIGH
**Rule**: MUST NOT have two modules that import from each other. Extract shared types to a common ancestor.

**Detect**: Build an import graph from the changed files. Flag any cycles.

---

## TS09 — Result Type for Recoverable Errors

**Severity**: MEDIUM
**Rule**: SHOULD use a `Result<T, E>` pattern for operations with expected, recoverable failures (file not found, parse error, validation). Reserve thrown exceptions for unrecoverable situations.

**Detect**: Flag functions that throw for expected conditions (e.g., `throw new Error('File not found')` for a missing optional file). Suggest returning a Result instead.

---

## TS10 — No Floating Promises

**Severity**: HIGH
**Rule**: MUST always `await` or return every Promise. MUST NOT let promises float un-awaited without explicit `void` prefix.

**Detect**: Flag `async` function calls that are neither awaited, returned, nor prefixed with `void`.

```ts
// WRONG
fetchData(); // floating promise

// CORRECT
await fetchData();
// or
void backgroundTask(); // intentionally fire-and-forget
```

---

## TS11 — Promise.all for Concurrent Operations

**Severity**: MEDIUM
**Rule**: MUST use `Promise.all()` for concurrent independent async operations, not sequential await in a loop.

**Detect**: Flag `for` or `forEach` loops containing `await` where iterations are independent.

```ts
// WRONG
for (const file of files) { await processFile(file); }

// CORRECT
await Promise.all(files.map(file => processFile(file)));
```

---

## TS12 — Nullish Coalescing Over Logical OR

**Severity**: LOW
**Rule**: SHOULD prefer `??` over `||` for default values to avoid falsy-value bugs with `0`, `""`, `false`.

**Detect**: Flag `|| defaultValue` patterns where the left side could legitimately be `0`, `""`, or `false`.

---

## TS13 — Exhaustive Switch

**Severity**: HIGH
**Rule**: Switch statements over discriminated unions MUST include a `default: assertNever(x)` for exhaustiveness.

**Detect**: Flag switch statements on a discriminated union type that lack a default case or don't cover all variants.
