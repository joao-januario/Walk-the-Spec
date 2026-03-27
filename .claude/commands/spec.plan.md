---
description: Execute the implementation planning workflow using the plan template to generate design artifacts.
handoffs:
  - label: Implement Feature
    agent: spec.implement
    prompt: Implement the planned feature
    send: true
  - label: Create Checklist
    agent: spec.checklist
    prompt: Create a checklist for the following domain...
---

## User Input

```text
$ARGUMENTS
```

Consider user input before proceeding.

## Pre-Execution Checks

**Bootstrap**: Run `bash .claude/specify/scripts/bash/bootstrap-phase.sh --command "spec.plan" --phase plan --json --copy-plan-template` from repo root and parse JSON for FEATURE_SPEC, IMPL_PLAN, SPECS_DIR, BRANCH, HAS_EXTENSIONS.

## Outline

1. **Load context**: Read FEATURE_SPEC, `.claude/specify/memory/constitution.md`, and IMPL_PLAN template in parallel.

2. **Execute plan workflow** using IMPL_PLAN template:
   - Technical Approach: 2-3 paragraphs of prose (how technologies interact, where code runs, data flow). No key-value metadata.
   - Architecture Decisions: one subsection per choice with Decision/Rationale/Alternatives rejected
   - Constitution Check from constitution; ERROR if violations unjustified
   - Project Structure: concrete file paths only, no placeholder trees
   - Phase 0: Generate research.md
   - Phase 1: Generate data-model.md, contracts/, quickstart.md; update agent context
   - Re-evaluate Constitution Check post-design

3. **Stop and report**: Command ends after Phase 2 planning. Report branch, IMPL_PLAN path, generated artifacts. Next step: `/spec.implement`.

**Teardown**: Run `bash .claude/specify/scripts/bash/teardown-phase.sh --command "spec.plan" --json` to signal command completion.

## Phases

### Phase 0: Outline & Research

1. **Identify unknowns** from feature spec and codebase:
   - Technology choices needing validation → research task
   - Integration patterns between components → patterns task
   - Architecture trade-offs needing analysis → decision task

2. **Generate and dispatch research agents**: Each agent MUST consult `.claude/specify/context/repo-map.md` (if it exists) before exploring source files. Research topics for unknowns/technology choices, compare approaches for architecture trade-offs.

3. **Consolidate findings** in `research.md`:

   ```markdown
   ## R1. [Topic Name]

   **Decision**: [what was chosen]

   **Rationale**: [why chosen]

   **Alternatives considered**:
   - [option]: [why rejected]
   ```

   Each finding: `## RN.` heading with `**Decision**:` and `**Rationale**:` paragraphs (parser uses these markers).

4. **Fill plan sections** using research: Technical Approach as prose, Architecture Decisions with Decision/Rationale/Alternatives, Project Structure with concrete paths.

**Output**: research.md with unknowns resolved, plan.md Technical Approach and Architecture Decisions filled

### Phase 1: Design & Contracts

**Prerequisites:** `research.md` complete

1. **Extract entities** from feature spec → `data-model.md`: entity name, fields, relationships, validation rules, state transitions if applicable.

2. **Define interface contracts** (if external interfaces exist) → `/contracts/`: document contract format appropriate to project type (APIs, CLI schemas, endpoints, grammars, UI contracts). Skip if purely internal.

3. **Agent context update**: Run `bash .claude/specify/scripts/bash/update-agent-context.sh --agent-type claude` — updates agent-specific context file with new technology from current plan, preserves manual additions.

**Output**: data-model.md, /contracts/*, quickstart.md, agent-specific file

## Key rules

- Use absolute paths
- ERROR on gate failures or unresolved clarifications
