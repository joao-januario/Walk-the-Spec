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

You **MUST** consider the user input before proceeding (if not empty).

## Pre-Execution Checks

**Bootstrap**: Run `.claude/specify/scripts/powershell/bootstrap-phase.ps1 -Command "spec.plan" -Phase plan -Json -CopyPlanTemplate` from repo root and parse JSON for FEATURE_SPEC, IMPL_PLAN, SPECS_DIR, BRANCH, HAS_EXTENSIONS. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

## Outline

1. **Load context**: Read FEATURE_SPEC, constitution.md, and IMPL_PLAN template in parallel (these are independent reads).
   - Read FEATURE_SPEC
   - Read `.claude/specify/memory/constitution.md`
   - Load IMPL_PLAN template (already copied by bootstrap)

2. **Execute plan workflow**: Follow the structure in IMPL_PLAN template to:
   - Fill Technical Approach as 2-3 paragraphs of prose describing how technologies interact, where code runs, and how data flows. Do NOT use key-value metadata lists.
   - Fill Architecture Decisions — one subsection per key technical choice with Decision/Rationale/Alternatives rejected. If a constitution violation must be justified, do it inline in the relevant decision's rationale.
   - Fill Constitution Check section from constitution
   - Evaluate gates (ERROR if violations unjustified)
   - Fill Project Structure with concrete file paths being created or modified — no generic placeholder trees or option blocks
   - Phase 0: Generate research.md (resolve all unknowns)
   - Phase 1: Generate data-model.md, contracts/, quickstart.md
   - Phase 1: Update agent context by running the agent script
   - Re-evaluate Constitution Check post-design

3. **Stop and report**: Command ends after Phase 2 planning. Report branch, IMPL_PLAN path, and generated artifacts. Next step is `/spec.implement`.

**Teardown**: Run `.claude/specify/scripts/powershell/teardown-phase.ps1 -Command "spec.plan" -Json` to signal command completion.

## Phases

### Phase 0: Outline & Research

1. **Identify unknowns** from the feature spec and existing codebase:
   - Technology choices that need validation → research task
   - Integration patterns between components → patterns task
   - Architecture trade-offs that need analysis → decision task

2. **Generate and dispatch research agents**:

   ```text
   For each unknown or technology choice:
     Task: "Research {topic} for {feature context}"
   For each architecture trade-off:
     Task: "Compare approaches for {decision} — evaluate {option A} vs {option B}"
   ```

3. **Consolidate findings** in `research.md` using this format per finding:

   ```markdown
   ## R1. [Topic Name]

   **Decision**: [what was chosen]

   **Rationale**: [why chosen]

   **Alternatives considered**:
   - [option]: [why rejected]
   ```

   Each finding gets a `## RN.` heading (R1, R2, R3...) with `**Decision**:` and `**Rationale**:` paragraphs. The app parser uses these markers to render research content.

4. **Fill plan sections** using research findings:
   - Write Technical Approach as prose (2-3 paragraphs, no key-value metadata)
   - Write Architecture Decisions with Decision/Rationale/Alternatives rejected per entry
   - Fill Project Structure with concrete file paths only

**Output**: research.md with all unknowns resolved, plan.md Technical Approach and Architecture Decisions filled

### Phase 1: Design & Contracts

**Prerequisites:** `research.md` complete

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Define interface contracts** (if project has external interfaces) → `/contracts/`:
   - Identify what interfaces the project exposes to users or other systems
   - Document the contract format appropriate for the project type
   - Examples: public APIs for libraries, command schemas for CLI tools, endpoints for web services, grammars for parsers, UI contracts for applications
   - Skip if project is purely internal (build scripts, one-off tools, etc.)

3. **Agent context update**:
   - Run `.claude/specify/scripts/powershell/update-agent-context.ps1 -AgentType claude`
   - These scripts detect which AI agent is in use
   - Update the appropriate agent-specific context file
   - Add only new technology from current plan
   - Preserve manual additions between markers

**Output**: data-model.md, /contracts/*, quickstart.md, agent-specific file

## Key rules

- Use absolute paths
- ERROR on gate failures or unresolved clarifications
