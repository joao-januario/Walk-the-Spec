---
description: Generate code deep-dives for notable implementation pieces — optional step after /spec.implement
---

## User Input

```text
$ARGUMENTS
```

Consider user input before proceeding.

**Status Signal**: Run `bash .claude/specify/scripts/bash/bootstrap-phase.sh --command "spec.dive" --phase dive --json` to signal command start.

## Outline

1. Run `bash .claude/specify/scripts/bash/check-prerequisites.sh --json` from repo root and parse FEATURE_DIR.

2. **Load context**: Read `summary.md` (Implementation Overview steps) and `glossary.md` from FEATURE_DIR. Use `git diff main --name-only` to get the list of changed files — read only those files by path.

   **PROHIBITED**: Reading files not in the diff. Running Glob. Running broad Grep. "Exploring" to understand the project. You are writing deep-dives about code that was CHANGED — the diff tells you exactly which files. Read those and only those.

   For branches with **<= 10 changed files**, write all deep-dives yourself inline. Only spawn sub-agents for branches with 10+ files needing deep-dives. When spawning: embed the exact file paths and relevant code snippets in the prompt. Sub-agents are **FORBIDDEN** from exploring beyond their assigned files — no Glob, no broad Grep, no reading unrelated code.

3. **Determine deep-dive candidates**: For each Implementation Overview step, ask: could a developer confidently modify/extend what this step introduced — knowing connections, dependencies, and breakage risks? If they'd need to trace code to figure out relationships, it needs a deep-dive. Steps that fully cover their scope (e.g., adding a union value) don't need one; steps introducing systems, touching multiple files, or having non-obvious relationships do.

4. **Write each deep-dive** as a comprehensive mini blog post weaving in naturally (not as checklist):
   - What it does and what problem it solves
   - Interface: function signatures, types, exports — inputs and outputs
   - Call sites: where used, what depends on it, data flow context
   - Internal mechanics: multiple code snippets with explanation between them
   - Edge cases and guards: what's non-obvious, what breaks if removed
   - Future considerations: technical debt, fragility, evolution paths

5. **Visual aids mandatory**: Each deep-dive MUST include mermaid diagrams (data flow, relationships, architecture) AND code snippets. Use tables for comparisons.

6. **Writing rules**: Zero-context readable; open with problem in plain English before code; explain why before showing what; file path in backticks before each snippet; full function shapes not ripped lines; all terms in glossary; `#### New to [X]?` explainer for every code section (mandatory).

7. **Be generous with detail** — include rather than omit.

8. **Write `deep-dives.md`** to FEATURE_DIR:

   ```markdown
   # Code Deep-Dives: [FEATURE NAME]

   **Branch**: `[branch]` | **Date**: [DATE]

   ## [Deep-dive title]

   [Full comprehensive breakdown]

   ---
   ```

9. **Update glossary.md** with new terms from deep-dives.

**Status Signal**: Run `bash .claude/specify/scripts/bash/teardown-phase.sh --command "spec.dive" --json` to signal command completion.

10. **Report completion**: List which overview steps got deep-dives and which didn't (with reasoning). Suggest `/spec.review` or `/spec.conclude`.
