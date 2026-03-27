# Architecture Best Practices

Universal architecture principles. `/spec.constitution` replaces this with project-specific guidelines.

## Principles

- **Separation of concerns**: Each module has a single, well-defined responsibility. Avoid mixing I/O, business logic, and presentation in the same module.
- **Explicit dependencies**: Modules declare their dependencies through imports, not global state. Prefer dependency injection where practical.
- **Layered boundaries**: Define clear boundaries between layers (data, logic, presentation). Cross-layer calls go through defined interfaces, not direct file access.
- **Minimal coupling**: Modules communicate through narrow interfaces. Changes to internal implementation should not ripple across the codebase.
- **Colocation**: Keep related code together. Tests near source, types near usage, configuration near the code that reads it.

## Review Checklist

- [ ] New modules have a single, named responsibility
- [ ] No circular dependencies between modules
- [ ] Cross-layer access goes through defined interfaces
- [ ] Shared state is minimized and explicitly managed
