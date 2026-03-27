---
description: Generate a custom checklist for the current feature based on user requirements.
model: sonnet
---

## Checklist Purpose: "Unit Tests for English"

**CRITICAL CONCEPT**: Checklists are **UNIT TESTS FOR REQUIREMENTS WRITING** — they validate quality, clarity, and completeness of requirements.

**NOT for verification/testing** (never "Verify X works", "Test X", "Confirm X"):
- ✅ "Are visual hierarchy requirements defined for all card types?" (completeness)
- ✅ "Is 'prominent display' quantified with specific sizing/positioning?" (clarity)
- ✅ "Are hover state requirements consistent across all interactive elements?" (consistency)
- ✅ "Does the spec define what happens when logo image fails to load?" (edge cases)

If your spec is code written in English, the checklist is its unit test suite.

## User Input

```text
$ARGUMENTS
```

Consider user input before proceeding.

**Status Signal**: Run `bash .claude/specify/scripts/bash/bootstrap-phase.sh --command "spec.checklist" --phase checklist --json` to signal command start.

## Execution Steps

1. **Setup**: Run `bash .claude/specify/scripts/bash/check-prerequisites.sh --json` from repo root and parse JSON for FEATURE_DIR and AVAILABLE_DOCS list. All file paths must be absolute.

2. **Clarify intent (dynamic)**: Derive up to THREE initial contextual clarifying questions. They MUST:
   - Be generated from the user's phrasing + extracted signals from spec/plan
   - Only ask about information that materially changes checklist content
   - Be skipped individually if already unambiguous in `$ARGUMENTS`

   Generation algorithm:
   1. Extract signals: feature domain keywords, risk indicators, stakeholder hints, explicit deliverables.
   2. Cluster into candidate focus areas (max 4) ranked by relevance.
   3. Identify probable audience & timing if not explicit.
   4. Detect missing dimensions: scope breadth, depth/rigor, risk emphasis, exclusion boundaries, measurable acceptance criteria.
   5. Formulate questions from these archetypes: scope refinement, risk prioritization, depth calibration, audience framing, boundary exclusion, scenario class gap.

   Question formatting:
   - If presenting options, use compact table: Option | Candidate | Why It Matters (A–E max)
   - Never ask the user to restate what they already said
   - No hallucination — if uncertain, ask explicitly

   Defaults when interaction impossible: Depth=Standard, Audience=Reviewer (PR) if code-related else Author, Focus=Top 2 relevance clusters.

   Output Q1/Q2/Q3. After answers: if ≥2 scenario classes remain unclear, you MAY ask up to TWO more (Q4/Q5) with one-line justification each. Max five total. Skip escalation if user declines.

3. **Understand user request**: Combine `$ARGUMENTS` + clarifying answers — derive checklist theme, consolidate must-have items, map focus to category scaffolding, infer missing context from spec/plan (do NOT hallucinate).

4. **Load feature context**: Read from FEATURE_DIR: spec.md and plan.md (if exists). Load only portions relevant to active focus areas. Prefer summarizing long sections into concise bullets. Use progressive disclosure.

5. **Generate checklist** — Create "Unit Tests for Requirements":
   - Create `FEATURE_DIR/checklists/` directory if needed
   - Filename: `[domain].md` (e.g., `ux.md`, `api.md`, `security.md`)
   - If file does NOT exist: Create new, start at CHK001
   - If file exists: Append, continue from last CHK ID
   - Never delete existing checklist content

   **CORE PRINCIPLE — Test Requirements, Not Implementation**:
   Every item MUST evaluate the REQUIREMENTS THEMSELVES for: Completeness, Clarity, Consistency, Measurability, Coverage.

   **Category Structure** — Group by requirement quality dimensions:
   - Requirement Completeness / Clarity / Consistency
   - Acceptance Criteria Quality
   - Scenario Coverage / Edge Case Coverage
   - Non-Functional Requirements
   - Dependencies & Assumptions
   - Ambiguities & Conflicts

   **Item Patterns**:

   ✅ CORRECT (testing requirements quality):
   - "Are the exact number and layout of featured episodes specified?" [Completeness]
   - "Is 'prominent display' quantified with specific sizing/positioning?" [Clarity]
   - "Are hover state requirements consistent across all interactive elements?" [Consistency]
   - "Are keyboard navigation requirements defined for all interactive UI?" [Coverage]
   - "Is the fallback behavior specified when logo image fails to load?" [Edge Cases]

   ❌ PROHIBITED (testing implementation):
   - Any item starting with "Verify", "Test", "Confirm", "Check" + implementation behavior
   - References to code execution, user actions, system behavior
   - "Displays correctly", "works properly", "functions as expected"
   - Test cases, test plans, QA procedures, implementation details

   ✅ REQUIRED PATTERNS:
   - "Are [requirement type] defined/specified/documented for [scenario]?"
   - "Is [vague term] quantified/clarified with specific criteria?"
   - "Are requirements consistent between [section A] and [section B]?"
   - "Can [requirement] be objectively measured/verified?"
   - "Does the spec define [missing aspect]?"

   **Item Structure**: Question format about requirement quality, quality dimension in brackets `[Completeness/Clarity/etc.]`, reference spec section `[Spec §X.Y]` when checking existing requirements, use `[Gap]` for missing requirements.

   **Scenario Classification**: Check requirements exist for Primary, Alternate, Exception/Error, Recovery, Non-Functional scenarios. Include resilience/rollback when state mutation occurs.

   **Traceability**: ≥80% of items MUST include traceability reference (`[Spec §X.Y]`, `[Gap]`, `[Ambiguity]`, `[Conflict]`, `[Assumption]`).

   **Content Consolidation**: Soft cap at 40 items — prioritize by risk/impact, merge near-duplicates, batch low-impact edge cases.

6. **Structure Reference**: Follow `.claude/specify/templates/checklist-template.md` for title, meta, category headings, ID formatting. Fallback: H1 title, purpose/created meta, `##` category sections, `- [ ] CHK### <item>` with globally incrementing IDs from CHK001.

7. **Report**: Output full path, item count, created vs appended. Summarize focus areas, depth level, actor/timing, user-specified must-haves incorporated.

**File naming**: Short descriptive names per domain. Multiple checklists allowed. Clean up obsolete checklists when done.

**Status Signal**: Run `bash .claude/specify/scripts/bash/teardown-phase.sh --command "spec.checklist" --json` to signal command completion.

## Example Checklist Types

**UX Requirements Quality** (`ux.md`): visual hierarchy clarity, element positioning completeness, interaction state consistency, accessibility coverage, image fallback edge cases, measurability of "prominent display".

**API Requirements Quality** (`api.md`): error response format completeness, rate limiting clarity, auth consistency, retry/timeout coverage, versioning gaps.

**Performance Requirements Quality** (`performance.md`): metric quantification clarity, critical journey coverage, load condition completeness, measurability, degradation edge cases.

**Security Requirements Quality** (`security.md`): protected resource coverage, data protection completeness, threat model traceability, compliance consistency, breach response gaps.
