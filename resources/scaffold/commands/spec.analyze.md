---
description: Perform a non-destructive cross-artifact consistency and quality analysis across spec.md and plan.md after plan generation.
model: sonnet
---

## User Input

```text
$ARGUMENTS
```

Consider user input before proceeding.

**Status Signal**: Run `bash .claude/specify/scripts/bash/bootstrap-phase.sh --command "spec.analyze" --phase analyze --json` to signal command start.

## Goal

Identify inconsistencies, duplications, ambiguities, and underspecified items across `spec.md` and `plan.md` before implementation. Runs only after `/spec.plan` has produced a complete `plan.md`.

## Operating Constraints

**STRICTLY READ-ONLY**: Do not modify any files. Output structured analysis report. Offer optional remediation plan (user must approve before any edits).

**Constitution Authority**: `.claude/specify/memory/constitution.md` is non-negotiable. Constitution conflicts are automatically CRITICAL — adjust spec/plan/tasks, never dilute the principle. Constitution changes require a separate explicit update outside `/spec.analyze`.

## Execution Steps

### 1. Initialize

Run `bash .claude/specify/scripts/bash/check-prerequisites.sh --json` once from repo root. Parse JSON for FEATURE_DIR. Derive SPEC = FEATURE_DIR/spec.md, PLAN = FEATURE_DIR/plan.md. Abort if any required file missing.

### 2. Load Artifacts

**From spec.md**: Overview, Functional Requirements, Non-Functional Requirements, User Stories, Edge Cases.
**From plan.md**: Architecture/stack, Data Model references, Phases, Technical constraints.
**From constitution**: Load `.claude/specify/memory/constitution.md` for principle validation.

### 3. Build Semantic Models

Create internal representations (not in output):
- **Requirements inventory**: Each requirement with stable slug key
- **User story/action inventory**: Discrete actions with acceptance criteria
- **Plan coverage mapping**: Map plan phases/components to requirements
- **Constitution rule set**: Extract principle names and MUST/SHOULD statements

### 4. Detection Passes

Limit to 50 findings total; aggregate remainder in overflow summary.

**A. Duplication**: Near-duplicate requirements; mark lower-quality for consolidation.
**B. Ambiguity**: Vague adjectives (fast, scalable, robust) lacking metrics; unresolved placeholders (TODO, TKTK, ???).
**C. Underspecification**: Requirements missing measurable outcome; stories missing acceptance criteria; plan referencing undefined components.
**D. Constitution Alignment**: Conflicts with MUST principles; missing mandated sections/quality gates.
**E. Coverage Gaps**: Requirements with zero plan phases; plan phases with no mapped requirement; non-functional requirements not reflected in plan.
**F. Inconsistency**: Terminology drift; data entities in plan but not spec (or vice versa); phase ordering contradictions; conflicting requirements.

### 5. Severity Assignment

- **CRITICAL**: Constitution MUST violation, missing core artifact, requirement with zero coverage blocking baseline functionality
- **HIGH**: Duplicate/conflicting requirement, ambiguous security/performance attribute, untestable acceptance criterion
- **MEDIUM**: Terminology drift, missing non-functional plan coverage, underspecified edge case
- **LOW**: Style/wording improvements, minor redundancy

### 6. Produce Analysis Report

Output Markdown (no file writes):

| ID | Category | Severity | Location(s) | Summary | Recommendation |
|----|----------|----------|-------------|---------|----------------|

**Coverage Summary Table**: Requirement Key | Has Plan Coverage? | Plan Phase/Component | Notes

**Constitution Alignment Issues** (if any), **Unmapped Plan Phases** (if any).

**Metrics**: Total Requirements, Total Plan Phases, Coverage %, Ambiguity/Duplication/Critical counts.

### 7. Next Actions

- CRITICAL: Resolve before `/spec.implement`
- LOW/MEDIUM only: May proceed with improvement suggestions
- Provide explicit command suggestions

### 8. Offer Remediation

Ask: "Would you like me to suggest concrete remediation edits for the top N issues?" (Do NOT apply automatically.)

**Status Signal**: Run `bash .claude/specify/scripts/bash/teardown-phase.sh --command "spec.analyze" --json` to signal command completion.

## Operating Principles

- **Minimal high-signal tokens**: Focus on actionable findings, not exhaustive documentation
- **Progressive disclosure**: Load artifacts incrementally
- **Token-efficient output**: 50-row findings limit; summarize overflow
- **Deterministic results**: Consistent IDs and counts on rerun
- **NEVER modify files** — read-only analysis
- **NEVER hallucinate missing sections** — report accurately
- **Prioritize constitution violations** — always CRITICAL
- **Report zero issues gracefully** with coverage statistics

$ARGUMENTS
