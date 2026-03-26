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

  DIAGRAMS: When describing multi-component interactions, data flows, or
  process pipelines, include a mermaid diagram alongside the prose. A diagram
  communicates architecture in seconds where paragraphs of prose cannot.
  Diagrams are OPTIONAL for trivial/single-file features — only include them
  when they add clarity over text alone.

  Use this heuristic to pick the right diagram type:

  | Scenario                              | Diagram type       |
  |---------------------------------------|--------------------|
  | Data flowing through stages/processes | flowchart          |
  | Component-to-component interaction    | sequenceDiagram    |
  | Object lifecycle / state transitions  | stateDiagram-v2    |
  | Entity relationships / data model     | classDiagram       |
  | System boundary / deployment layout   | flowchart (subgraphs) |

  For complex systems with many interacting components, break into focused
  sub-diagrams (one per concern) rather than one monolithic chart.

  OUTPUT FORMAT SPECIFICATION:

  | Visual element           | Markdown convention                          |
  |--------------------------|----------------------------------------------|
  | Prose explanation         | Plain paragraphs                             |
  | Diagram                  | Fenced block with ```mermaid language         |
  | Code snippet             | Fenced block with language tag (```typescript)|
  | File structure            | Fenced block with ```text language            |

  NEVER use ASCII art for diagrams — always use ```mermaid fenced blocks.
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

  DIAGRAMS IN DECISIONS: When a decision involves component relationships,
  data flow, or state transitions, the rationale SHOULD include a mermaid
  diagram illustrating the chosen approach. A diagram of how data flows
  between processes can communicate in seconds what paragraphs of prose
  cannot. Use ```mermaid fenced blocks, never ASCII art.

  Do NOT force diagrams into text-only decisions (naming conventions, code
  style choices, dependency selections) — prose is sufficient when the
  decision doesn't involve visual/spatial relationships.

  For complex decisions, break into focused sub-diagrams rather than one
  monolithic chart with 20+ nodes.
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
