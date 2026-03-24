# Research: Test Feature

**Branch**: `001-test-feature` | **Date**: 2026-01-15

## Decision 1: Storage Approach

**Decision**: Use JSON files for widget persistence.

**Rationale**: Simplest option for a local single-user tool. No database setup needed. Files are human-readable and version-controllable.

**Alternatives considered**:
- **SQLite**: More structured but adds a dependency. Overkill for <100 widgets.
- **In-memory only**: Fast but loses data on restart.

## Decision 2: Validation Strategy

**Decision**: Validate on the server side before persisting.

**Rationale**: Single source of truth for validation rules. Client-side validation is optional UX enhancement.

**Alternatives considered**:
- **Client-only validation**: Faster feedback but can be bypassed.
- **Database constraints**: Ties validation to storage layer.
