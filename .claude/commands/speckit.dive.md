---
description: Generate code deep-dives for notable implementation pieces — optional step after /speckit.implement
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. Run `.claude/specify/scripts/powershell/check-prerequisites.ps1 -Json` from repo root and parse FEATURE_DIR. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Load context**:
   - Read `summary.md` from FEATURE_DIR — specifically the Implementation Overview steps
   - Read all source files changed on this branch (`git diff main --name-only -- src/`)
   - Read `glossary.md` from FEATURE_DIR

3. **Determine which steps need deep-dives** by applying this criteria to each Implementation Overview step:

   After reading the overview step, could a developer confidently modify or extend what that step introduced — knowing what it connects to, what depends on it, and what could break? If they'd need to trace through code to figure out those relationships, that's a deep-dive.

   If the overview step fully covers the scope of the change (like adding a value to a union type), no deep-dive needed. If the change has scope beyond what the overview could cover while staying an overview — because it introduces a system rather than a value, touches multiple files, or has non-obvious relationships — it's a deep-dive candidate.

4. **For each deep-dive**, read the relevant source files and write a comprehensive mini blog post covering ALL of these (woven naturally into the narrative, not as a checklist):

   - **WHAT IT IS**: What does this piece do? What problem does it solve?
   - **THE INTERFACE**: Show the function signature, types, exports. What goes in, what comes out.
   - **WHO CALLS IT**: Where is this used? What depends on it? Show the call sites with enough context to understand the data flow.
   - **HOW IT WORKS INTERNALLY**: Multiple code snippets walking through the logic. Not one block — break it into pieces with explanation between them.
   - **EDGE CASES AND GUARDS**: What non-obvious things does it handle? What would break if you removed a guard?
   - **FUTURE CONSIDERATIONS**: What technical debt exists? What would need to change if requirements evolved? What's fragile?

5. **Visual aids are mandatory**: Each deep-dive MUST include both mermaid diagrams and code snippets. Use mermaid for data flow, relationships, and architecture. Use code for implementation details. Use tables for comparisons.

6. **Writing rules** (same as summary template):
   - Zero-context: every section readable by a developer who has never opened this repo
   - Open with the problem in plain English before code
   - Explain why before showing what
   - File path in backticks on its own line before each code snippet
   - Only non-obvious inline comments — explanations in prose, not code comments
   - Full function shapes, not ripped-out lines
   - Every abbreviation and internal term must be in the glossary
   - `#### New to [X]?` explainer for every code section (mandatory)

7. **Be generous with detail** — assume the reader wants to know more, not less. It's better to include something than to omit it.

8. **Write deep-dives.md** to FEATURE_DIR with this structure:

   ```markdown
   # Code Deep-Dives: [FEATURE NAME]

   **Branch**: `[branch]` | **Date**: [DATE]

   ## [Deep-dive 1 title]

   [Full comprehensive breakdown]

   ---

   ## [Deep-dive 2 title]

   [Full comprehensive breakdown]
   ```

9. **Update glossary.md** — add any new terms that appear in the deep-dives.

10. **Report completion**: List which overview steps got deep-dives and which didn't (with reasoning). Suggest `/speckit.review` or `/speckit.conclude` as next steps.
