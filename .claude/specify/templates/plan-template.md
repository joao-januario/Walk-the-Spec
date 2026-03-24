# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Approach

<!--
  Write 2-3 paragraphs describing HOW this feature will be built.
  Focus on:
  - What technologies are involved and how they interact
  - Where the code runs (processes, runtimes, environments)
  - Key integration points between components
  - How data flows through the system for this feature

  Do NOT use key-value metadata lists. Write as an engineer explaining the
  approach to another engineer.
-->

[Describe the technical approach as prose — what technologies interact, how data flows, where code runs]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on constitution file. If violations exist, justify them inline in the Architecture Decisions section below.]

## Architecture Decisions

<!--
  One subsection per key technical decision. Number sequentially.
  Each decision MUST include:
  - **Decision**: What was decided (one sentence)
  - **Rationale**: Why this choice was made
  - **Alternatives rejected**: What else was considered and why it was rejected

  If there are no architecture decisions (trivial bug fix), state:
  "No new architectural choices — this change modifies existing patterns."

  If a Constitution Check violation must be justified, include the justification
  in the rationale of the relevant decision.
-->

### 1. [Decision title]

**Decision**: [What was decided]

**Rationale**: [Why this was chosen]

**Alternatives rejected**: [What else was considered and why]

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Files modified

<!--
  List ONLY concrete file paths being created or modified for this feature.
  Do NOT include generic placeholder trees or option blocks.
  Group by area (e.g., "# Backend", "# Frontend", "# Tests").
-->

```text
[Concrete file paths for this feature — new files and modified files only]
```
