# Code Quality Best Practices

Universal code quality principles. `/spec.constitution` replaces this with project-specific guidelines.

## Principles

- **Readability over cleverness**: Code is read far more than it is written. Prefer explicit, boring code over clever abstractions. If it takes more than a few seconds to understand a line, simplify it.
- **Small functions**: Functions should do one thing. If a function needs a comment explaining what its sections do, extract those sections into named functions.
- **No dead code**: Remove unused imports, variables, functions, and commented-out code. Version control preserves history — the codebase should only contain live code.
- **Consistent naming**: Use descriptive, consistent names. Follow the project's naming conventions (casing, prefixes, verb forms for functions, noun forms for types).
- **Error handling**: Every error path must be handled — either recover, propagate, or fail explicitly. Never silently swallow errors. Every catch block must re-throw, return an error, or log with context.
- **Keep modules small**: Files and modules should be small enough to understand in a single reading session. If a file exceeds ~200 lines, consider splitting by responsibility.

## Review Checklist

- [ ] No dead code, unused imports, or commented-out blocks
- [ ] Functions have single responsibilities
- [ ] Error paths are handled explicitly
- [ ] Naming is consistent with project conventions
