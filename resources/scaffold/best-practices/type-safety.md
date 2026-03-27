# Type Safety Best Practices

Universal type safety principles. `/spec.constitution` replaces this with project-specific guidelines.

## Principles

- **Strict mode**: Enable the strictest type checking your language supports. Treat type errors as bugs, not warnings.
- **No escape hatches in production**: Avoid `any`, unsafe casts, or type suppression comments in production code. Use `unknown` with runtime guards when the type is truly unknown.
- **Null safety**: Handle nullable values explicitly. Prefer optional chaining and nullish coalescing over manual null checks where available.
- **Discriminated unions**: For variant types, use a literal discriminator field and exhaustive switches. This makes illegal states unrepresentable.
- **Error types**: Model expected failures as typed values (Result types, error unions), not thrown exceptions. Reserve exceptions for truly unrecoverable situations.

## Review Checklist

- [ ] No type escape hatches (`any`, unsafe casts) in production code
- [ ] Nullable values handled explicitly
- [ ] Error cases modeled as typed values where appropriate
- [ ] Variant types use discriminated unions with exhaustive handling
