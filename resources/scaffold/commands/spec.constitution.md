---
description: Create or update the project constitution from interactive or provided principle inputs, ensuring all dependent templates stay in sync.
handoffs:
  - label: Build Specification
    agent: spec.specify
    prompt: Implement the feature specification based on the updated constitution. I want to build...
---

## User Input

```text
$ARGUMENTS
```

Consider user input before proceeding.

**Status Signal**: Run `bash .claude/specify/scripts/bash/bootstrap-phase.sh --command "spec.constitution" --phase constitution --json --skip-prereqs` to signal command start.

## Outline

Update the project constitution at `.claude/specify/memory/constitution.md`. This file is a TEMPLATE with placeholder tokens in square brackets (e.g. `[PROJECT_NAME]`, `[PRINCIPLE_1_NAME]`). Your job: collect/derive concrete values, fill the template, and propagate amendments across dependent artifacts.

If `.claude/specify/memory/constitution.md` doesn't exist, copy from `.claude/specify/templates/constitution-template.md` first.

### Execution Flow

1. **Load** the existing constitution. Identify every `[ALL_CAPS_IDENTIFIER]` placeholder token.
   The user might require fewer or more principles than the template — respect any specified count and adjust accordingly.

2. **Collect/derive values** for placeholders:
   - Use values from user input first, then infer from repo context (README, docs, prior versions).
   - `RATIFICATION_DATE`: original adoption date (ask or mark TODO if unknown). `LAST_AMENDED_DATE`: today if changes made, otherwise keep previous.
   - `CONSTITUTION_VERSION`: increment per semver — MAJOR: incompatible governance/principle removals or redefinitions; MINOR: new principle/section or material expansion; PATCH: clarifications, wording, typos. If ambiguous, propose reasoning before finalizing.

3. **Draft updated constitution**:
   - Replace every placeholder with concrete text (no bracketed tokens left unless intentionally deferred — justify any retained).
   - Preserve heading hierarchy. Each Principle section: succinct name, paragraph/bullets for non-negotiable rules, explicit rationale if not obvious.
   - Governance section must list amendment procedure, versioning policy, and compliance review expectations.

4. **Consistency propagation** — read and validate alignment with:
   - `.claude/specify/templates/plan-template.md` (Constitution Check / rules)
   - `.claude/specify/templates/spec-template.md` (scope/requirements)
   - `.claude/specify/templates/tasks-template.md` (task categorization)
   - `.claude/specify/templates/commands/*.md` (no outdated agent-specific references)
   - Runtime docs (`README.md`, `docs/quickstart.md`, agent guidance files) — update principle references as needed.

5. **Sync Impact Report** (prepend as HTML comment atop constitution after update):
   - Version change: old -> new
   - Modified principles (old title -> new if renamed), added sections, removed sections
   - Templates requiring updates (with status and file paths)
   - Follow-up TODOs for deferred placeholders

6. **Validation**: No unexplained bracket tokens. Version matches report. Dates in ISO YYYY-MM-DD. Principles are declarative, testable — replace vague "should" with MUST/SHOULD + rationale.

7. **Write** the completed constitution to `.claude/specify/memory/constitution.md` (overwrite).

8. **Install Context Protocol in CLAUDE.md**:
   - Read `.claude/specify/templates/context-protocol.md` and project `CLAUDE.md`
   - If `## Context Protocol` section doesn't exist: insert before `<!-- MANUAL ADDITIONS START -->` marker (or at end)
   - If it exists: replace with current template content

9. **Output summary**: new version + bump rationale, Context Protocol install/update status, files needing manual follow-up, suggested commit message.

**Status Signal**: Run `bash .claude/specify/scripts/bash/teardown-phase.sh --command "spec.constitution" --json` to signal command completion.

### Formatting & Style

- Use Markdown headings exactly as in the template (do not demote/promote levels)
- Keep readability (<100 chars) without awkward breaks. Single blank line between sections. No trailing whitespace.
- Partial updates still require validation and version decision steps.
- Missing critical info: insert `TODO(<FIELD_NAME>): explanation` and include in Sync Impact Report.
- Always operate on existing `.claude/specify/memory/constitution.md` — never create a new template.
