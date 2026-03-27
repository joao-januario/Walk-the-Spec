# Testing Best Practices

Universal testing discipline. `/spec.constitution` replaces this with project-specific guidelines.

## Principles

- **TDD for core logic**: Write tests before implementation for core business logic modules. Red-green-refactor.
- **Tests are documentation**: Name test cases as sentences that describe behavior: "returns an error when the file does not exist." Avoid vague names like "works" or "handles edge case."
- **Isolation**: Each test must be independent. No shared mutable state between test cases. Restore all mocks and stubs after each test.
- **Unit vs integration**: Unit tests verify a single module with dependencies mocked. Integration tests verify multiple real modules working together. Keep them separate.
- **Speed**: Unit tests should run in milliseconds. If a test needs real I/O (filesystem, network, database), it's an integration test — label it accordingly.
- **Factory functions**: Use factory functions for test data instead of shared fixtures. Each test should construct its own input.

## Review Checklist

- [ ] Core logic modules have tests written before implementation
- [ ] Test names describe behavior as complete sentences
- [ ] No shared mutable state between test cases
- [ ] Unit and integration tests are clearly separated
