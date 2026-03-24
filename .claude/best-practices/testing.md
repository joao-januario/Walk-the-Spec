# Testing Best Practices

Rules for TDD workflow, Vitest patterns, test structure, and test quality.
Applies to: `tests/**/*.test.ts`, `vitest.config.ts`

---

## TT01 — TDD for Core Modules

**Severity**: HIGH
**Rule**: Core backend modules (parsers, writers, phase detector, config, scanner) MUST have tests written FIRST. Red-green-refactor.

**Detect**: For each module in `src/main/parser/`, `src/main/writer/`, `src/main/phase/`, `src/main/config/`, `src/main/projects/` — verify a corresponding `.test.ts` exists in `tests/unit/`.

---

## TT02 — Test Naming Convention

**Severity**: MEDIUM
**Rule**: `it` blocks MUST be named as sentences starting with a verb: `it('returns an error when the file does not exist')`. MUST NOT use vague names.

**Detect**: Flag `it('works')`, `it('should work')`, `it('test 1')`, `it('handles edge case')`, or any `it` description under 5 words.

```ts
// WRONG
it('works', () => { ... });
it('test parsing', () => { ... });

// CORRECT
it('extracts user stories with priority and GWT scenarios', () => { ... });
it('returns empty array when file content is empty', () => { ... });
```

---

## TT03 — Describe Block Structure

**Severity**: MEDIUM
**Rule**: MUST use `describe` blocks that name the module or function under test. SHOULD nest for method/scenario grouping.

**Detect**: Flag test files without a top-level `describe`. Flag `describe` blocks with generic names like `describe('tests')`.

---

## TT04 — Mock Cleanup

**Severity**: HIGH
**Rule**: MUST restore all mocks after each test. MUST NOT share mutable state between `it` blocks.

**Detect**: Flag test files that use `vi.mock`, `vi.fn`, or `vi.spyOn` without `afterEach(() => vi.restoreAllMocks())` or `restoreMocks: true` in config.

---

## TT05 — Test Isolation

**Severity**: HIGH
**Rule**: Each `it` block MUST be independently runnable. MUST NOT depend on execution order or state from a previous test.

**Detect**: Flag tests that reference variables set in other `it` blocks. Flag shared `let` variables modified inside `it` blocks without `beforeEach` reset.

---

## TT06 — Unit vs Integration Separation

**Severity**: MEDIUM
**Rule**: Unit tests (single module, deps mocked) MUST be in `tests/unit/`. Integration tests (multiple real modules) MUST be in `tests/integration/`. MUST NOT mix them.

**Detect**: Flag tests in `tests/unit/` that import from multiple `src/main/` modules without mocking.

---

## TT07 — Unit Test Speed

**Severity**: MEDIUM
**Rule**: Individual unit tests MUST complete in under 50ms. If a test needs real filesystem, network, or timers, it's an integration test.

**Detect**: Run test suite and flag any unit test taking over 100ms.

---

## TT08 — Factory Functions for Test Data

**Severity**: LOW
**Rule**: SHOULD use factory functions for creating test data rather than shared mutable fixture objects.

**Detect**: Flag test files that declare `const fixture = { ... }` at module scope and mutate it inside tests.

```ts
// WRONG
const spec = { id: 'FR-001', text: 'test' };
it('test 1', () => { spec.text = 'modified'; ... });

// CORRECT
function createSpec(overrides?: Partial<Spec>): Spec {
  return { id: 'FR-001', text: 'default', ...overrides };
}
it('handles modified text', () => {
  const spec = createSpec({ text: 'modified' });
  ...
});
```

---

## TT09 — No Empty Catch in Tests

**Severity**: HIGH
**Rule**: Tests MUST NOT silently swallow errors. If testing error paths, use `expect(() => ...).toThrow()` or assert the error result explicitly.

**Detect**: Flag `try/catch` in test files where the catch block doesn't contain an `expect()` assertion.

---

## TT10 — Fixture Co-location

**Severity**: LOW
**Rule**: Test fixtures (sample files, JSON, markdown) SHOULD be in `tests/fixtures/` with descriptive names.

**Detect**: Flag test files that inline large string fixtures (>20 lines) instead of reading from fixture files.

---

## TT11 — Assertions Must Be Specific

**Severity**: MEDIUM
**Rule**: MUST use specific assertions (`toBe`, `toEqual`, `toContain`, `toHaveLength`) over generic truthiness checks (`toBeTruthy`, `toBeDefined`).

**Detect**: Flag `expect(x).toBeTruthy()` or `expect(x).toBeDefined()` that could be replaced with a more specific assertion.

```ts
// WRONG
expect(result).toBeTruthy();
expect(result).toBeDefined();

// CORRECT
expect(result).toHaveLength(3);
expect(result.id).toBe('FR-001');
```
