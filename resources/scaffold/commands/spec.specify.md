---
description: Create or update the feature specification from a natural language feature description.
handoffs:
  - label: Build Technical Plan
    agent: spec.plan
    prompt: Create a plan for the spec. I am building with...
  - label: Clarify Spec Requirements
    agent: spec.clarify
    prompt: Clarify specification requirements
    send: true
---

## User Input

```text
$ARGUMENTS
```

Consider user input before proceeding.

## Pre-Execution Checks

**Check for extension hooks (before specification)**:
- Check if `.claude/specify/extensions.yml` exists in the project root.
- If it exists, read it and look for entries under the `hooks.before_specify` key
- If the YAML cannot be parsed or is invalid, skip hook checking silently and continue normally
- Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
- For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
  - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
  - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
- For each executable hook, output based on its `optional` flag:
  - **Optional hook** (`optional: true`): Display extension name, command, description, prompt. Label as "Optional Pre-Hook".
  - **Mandatory hook** (`optional: false`): Display as "Automatic Pre-Hook", execute `/{command}`, wait for result before proceeding.
- If no hooks registered or file doesn't exist, skip silently

**Status Signal**: Run `bash .claude/specify/scripts/bash/write-status.sh --command "spec.specify" --status "started"` to signal command start.

## Outline

The text the user typed after `/spec.specify` in the triggering message **is** the feature description. Do not ask the user to repeat it unless they provided an empty command.

Given that feature description:

1. **Generate a concise short name** (2-4 words) for the branch:
   - Extract meaningful keywords, use action-noun format (e.g., "user-auth", "fix-payment-timeout")
   - Preserve technical terms/acronyms

2. **Create the feature branch** by running the script with `--short-name` (and `--json`), do NOT pass `--number` (auto-detected):
   - Example: `bash .claude/specify/scripts/bash/create-new-feature.sh "$ARGUMENTS" --json --short-name "user-auth" "Add user authentication"`
   - Always include `--json`, only run once per feature
   - JSON output contains BRANCH_NAME and SPEC_FILE paths

3. **Read the created spec file**: The script creates SPEC_FILE with template content. You MUST Read it now (Write refuses to overwrite unread files).

4. Load `.claude/specify/templates/spec-template.md` to understand required sections.

5. Follow this execution flow:
    1. Parse user description — if empty: ERROR "No feature description provided"
    2. Extract key concepts: actors, actions, data, constraints
    3. For unclear aspects:
       - Make informed guesses based on context and industry standards
       - Only mark with [NEEDS CLARIFICATION: specific question] if the choice significantly impacts scope/UX, multiple reasonable interpretations exist, and no reasonable default exists
       - **LIMIT: Maximum 3 [NEEDS CLARIFICATION] markers**
       - Priority: scope > security/privacy > UX > technical details
    4. Fill User Scenarios & Testing section (ERROR if no clear user flow)
    5. Generate testable Functional Requirements with reasonable defaults (document assumptions)
    6. Define measurable, technology-agnostic Success Criteria (quantitative + qualitative)
    7. Identify Key Entities (if data involved)
    8. Return: SUCCESS

6. Write specification to SPEC_FILE using template structure, replacing placeholders with concrete details.

7. **Specification Quality Validation**: After writing, validate against quality criteria:

   a. **Create Spec Quality Checklist** at `FEATURE_DIR/checklists/requirements.md`:

      ```markdown
      # Specification Quality Checklist: [FEATURE NAME]

      **Purpose**: Validate specification completeness and quality before proceeding to planning
      **Created**: [DATE]
      **Feature**: [Link to spec.md]

      ## Content Quality

      - [ ] No implementation details (languages, frameworks, APIs)
      - [ ] Focused on user value and business needs
      - [ ] Written for non-technical stakeholders
      - [ ] All mandatory sections completed

      ## Requirement Completeness

      - [ ] No [NEEDS CLARIFICATION] markers remain
      - [ ] Requirements are testable and unambiguous
      - [ ] Success criteria are measurable and technology-agnostic
      - [ ] All acceptance scenarios defined
      - [ ] Edge cases identified
      - [ ] Scope clearly bounded
      - [ ] Dependencies and assumptions identified

      ## Feature Readiness

      - [ ] All functional requirements have clear acceptance criteria
      - [ ] User scenarios cover primary flows
      - [ ] Feature meets measurable outcomes defined in Success Criteria
      - [ ] No implementation details leak into specification

      ## Notes

      - Items marked incomplete require spec updates before `/spec.clarify` or `/spec.plan`
      ```

   b. **Run Validation Check**: Review spec against each item, document specific issues.

   c. **Handle Validation Results**:
      - **All pass**: Mark checklist complete, proceed
      - **Items fail (excluding [NEEDS CLARIFICATION])**: List failures, fix in memory, re-validate (max 3 passes). If still failing, document in checklist notes and warn user.
      - **[NEEDS CLARIFICATION] markers remain**: Extract all markers (keep max 3 most critical, make informed guesses for rest). Present each as:

           ```markdown
           ## Question [N]: [Topic]

           **Context**: [Quote relevant spec section]
           **What we need to know**: [Specific question]

           **Suggested Answers**:

           | Option | Answer | Implications |
           |--------|--------|--------------|
           | A      | [Answer] | [Implications] |
           | B      | [Answer] | [Implications] |
           | C      | [Answer] | [Implications] |
           | Custom | Provide your own | [How to provide] |

           **Your choice**: _[Wait for response]_
           ```

        Present all questions together (max 3, sequential Q1/Q2/Q3). After responses, update spec and re-validate.

   d. **Update Checklist**: Write final pass/fail status once after all validation.

8. Report completion with branch name, spec file path, checklist results. The completion message MUST end with: "Next step: `/spec.clarify` (recommended before planning), or `/spec.plan` to skip clarification."

**Status Signal**: Run `bash .claude/specify/scripts/bash/write-status.sh --command "spec.specify" --status "completed"` to signal command completion.

9. **Check for extension hooks (after specification)**:
   - Same hook processing logic as pre-execution hooks, but check `hooks.after_specify` key
   - Optional hooks: display info. Mandatory hooks: auto-execute.
   - Skip silently if no hooks or file doesn't exist.

**NOTE:** The script creates and checks out the new branch and initializes the spec file before writing.

## Quick Guidelines

- Focus on **WHAT** users need and **WHY** — avoid HOW (no tech stack, APIs, code structure).
- Written for business stakeholders, not developers.
- DO NOT embed checklists in the spec (separate command).
- Mandatory sections must be completed; remove inapplicable optional sections entirely.
- Make informed guesses, document assumptions, limit clarifications to max 3 critical decisions.
- Priority: scope > security/privacy > UX > technical details.

**Reasonable defaults** (don't ask about): data retention (industry-standard), performance targets (standard expectations), error handling (user-friendly with fallbacks), auth method (session/OAuth2 for web), integration patterns (project-appropriate).

### Success Criteria Guidelines

Success criteria must be **measurable**, **technology-agnostic**, **user-focused**, **verifiable**, with key metrics in backticks and MUST/SHOULD language.

**Good**: "Users MUST complete checkout in under `3 minutes`", "System MUST support `10,000` concurrent users", "`95%` of searches return results in under `1 second`"

**Bad** (implementation-focused): "API response time under 200ms", "Database handles 1000 TPS", "React components render efficiently", "Redis cache hit rate above 80%"
