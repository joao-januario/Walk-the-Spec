# Security Best Practices

Universal security principles. `/spec.constitution` replaces this with project-specific guidelines.

## Principles

- **Validate at boundaries**: All external input (user input, API responses, file reads, environment variables) must be validated before use. Trust nothing from outside the system.
- **Principle of least privilege**: Code should request only the permissions it needs. Avoid broad access patterns when narrow ones suffice.
- **Secrets management**: Never hardcode secrets, tokens, or credentials. Use environment variables or a secrets manager. Never log sensitive values.
- **Error messages**: Do not expose internal details (stack traces, file paths, database schemas) in user-facing error messages.
- **Dependency hygiene**: Keep dependencies up to date. Review new dependencies for maintenance status and known vulnerabilities before adoption.

## Review Checklist

- [ ] No secrets or credentials in source code
- [ ] All external input is validated before use
- [ ] Error messages do not leak internal details
- [ ] Dependencies are pinned and reviewed
