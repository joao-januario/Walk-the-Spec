---
description: Identify underspecified areas in the current feature spec by asking up to 5 highly targeted clarification questions and encoding answers back into the spec.
handoffs:
  - label: Build Technical Plan
    agent: spec.plan
    prompt: Create a plan for the spec. I am building with...
---

## User Input

```text
$ARGUMENTS
```

Consider user input before proceeding.

**Status Signal**: Run `bash .claude/specify/scripts/bash/write-status.sh --command "spec.clarify" --status "started"` to signal command start.

## Outline

Goal: Detect and reduce ambiguity or missing decisions in the active feature spec, recording clarifications directly in the spec file.

This workflow runs BEFORE `/spec.plan`. If user explicitly skips clarification, warn that downstream rework risk increases.

Execution steps:

1. Run `bash .claude/specify/scripts/bash/check-prerequisites.sh --json --paths-only` from repo root **once**. Parse `FEATURE_DIR`, `FEATURE_SPEC`. If JSON parsing fails, abort and instruct user to re-run `/spec.specify`.

2. Load spec file. Perform structured ambiguity & coverage scan using this taxonomy. For each category, mark: Clear / Partial / Missing.

   **Functional Scope**: Core user goals & success criteria, explicit out-of-scope, user roles/personas.
   **Domain & Data Model**: Entities/attributes/relationships, identity/uniqueness, lifecycle/state transitions, volume/scale.
   **Interaction & UX**: Critical journeys, error/empty/loading states, accessibility/localization.
   **Non-Functional**: Performance, scalability, reliability/availability, observability, security/privacy, compliance.
   **Integration & Dependencies**: External services/APIs + failure modes, data formats, protocol/versioning.
   **Edge Cases & Failures**: Negative scenarios, rate limiting, conflict resolution.
   **Constraints & Tradeoffs**: Technical constraints, rejected alternatives.
   **Terminology**: Canonical glossary, avoided synonyms.
   **Completion Signals**: Acceptance criteria testability, measurable DoD indicators.
   **Misc**: TODO markers, vague adjectives ("robust", "intuitive") lacking quantification.

   For Partial/Missing categories, add candidate question unless clarification wouldn't materially change implementation or is better deferred to planning.

3. Generate (internally) prioritized queue of max 5 candidate questions. Constraints:
    - Each answerable via multiple-choice (2-5 options) OR short answer (<=5 words)
    - Must materially impact architecture, data modeling, task decomposition, test design, UX, ops, or compliance
    - Balance category coverage — prioritize highest-impact unresolved areas
    - Exclude already-answered, trivial stylistic, or plan-level execution details
    - Favor clarifications reducing downstream rework risk
    - If >5 categories unresolved, select top 5 by Impact * Uncertainty

4. Sequential questioning loop (interactive):
    - Present ONE question at a time.
    - **Multiple-choice**: Show recommended option with reasoning at top (`**Recommended:** Option [X] - <reasoning>`), then options table, then: "Reply with option letter, 'yes'/'recommended' to accept, or your own answer."
    - **Short-answer**: Show suggested answer with reasoning (`**Suggested:** <answer> - <reasoning>`), then: "Format: <=5 words. Reply 'yes'/'suggested' to accept, or your own answer."
    - After answer: validate, disambiguate if needed (same question count), record in memory, advance.
    - Stop when: all critical ambiguities resolved, user signals done, or 5 questions reached.
    - Never reveal future queued questions.
    - If no valid questions at start, report no critical ambiguities.

5. Integration after EACH accepted answer:
    - Maintain in-memory spec representation.
    - Ensure `## Clarifications` section exists (create after highest-level overview section if missing) with `### Session YYYY-MM-DD` subheading.
    - Append: `- Q: <question> → A: <answer>`.
    - Apply to most appropriate section: functional → Functional Requirements, UX → User Stories, data → Data Model, non-functional → Quality Attributes (convert vague to metric), edge case → Edge Cases, terminology → normalize across spec.
    - Replace invalidated statements (no obsolete contradictions).
    - Accumulate all changes in memory. Write spec once after all questions answered or user signals completion.
    - Preserve formatting and heading hierarchy. Keep insertions minimal and testable.

6. Validation (before each write + final pass):
   - One bullet per accepted answer in Clarifications, total ≤ 5.
   - Updated sections have no lingering vague placeholders the answer resolved.
   - No contradictory earlier statements remain.
   - Valid markdown structure; only new headings: `## Clarifications`, `### Session YYYY-MM-DD`.
   - Terminology consistent across all updated sections.

7. Write updated spec to `FEATURE_SPEC`.

8. Report completion:
   - Questions asked & answered count, path to updated spec, sections touched.
   - Coverage summary table: each taxonomy category with Status (Resolved / Deferred / Clear / Outstanding).
   - If Outstanding/Deferred remain, recommend whether to proceed to `/spec.plan` or re-run `/spec.clarify`.
   - Suggested next command.

Behavior rules:
- No meaningful ambiguities found → "No critical ambiguities detected." and suggest proceeding.
- Spec missing → instruct to run `/spec.specify` first.
- Never exceed 5 questions (retries don't count as new).
- Avoid speculative tech stack questions unless blocking functional clarity.
- Respect early termination signals ("stop", "done", "proceed").
- Full coverage → compact summary (all Clear), suggest advancing.
- Quota reached with high-impact unresolved → flag as Deferred with rationale.

**Status Signal**: Run `bash .claude/specify/scripts/bash/write-status.sh --command "spec.clarify" --status "completed"` to signal command completion.

Context for prioritization: $ARGUMENTS
