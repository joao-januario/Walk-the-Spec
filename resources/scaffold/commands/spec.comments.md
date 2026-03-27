---
description: Apply clipboard-pasted section comments to artifact files by rewriting the targeted sections.
model: sonnet
---

## User Input

```text
$ARGUMENTS
```

Consider user input before proceeding.

**Status Signal**: Run `bash .claude/specify/scripts/bash/check-prerequisites.sh --json --paths-only` from repo root and parse JSON for FEATURE_DIR, FEATURE_SPEC.

## Outline

Apply structured section comments (pasted from the Walk the Spec app clipboard) to the appropriate artifact files.

### Step 1: Parse the comment input

The user's input (`$ARGUMENTS`) contains structured comment blocks:

```
[DocType] > Section Heading:
comment text here

[DocType] > Another Section:
more feedback
```

Parse each block by splitting on blank lines and matching `[DocType] > Section Heading:` to extract doc type (Spec, Plan, Research, Summary, Review), section heading, and comment text.

If input is empty or unparseable, ERROR: "No comment blocks found. Copy comments from the app first, then paste them as input to this command."

### Step 2: Locate artifact files

Run `bash .claude/specify/scripts/bash/check-prerequisites.sh --json --paths-only` to get FEATURE_DIR.

Map doc types to files: `Spec` → `spec.md`, `Plan` → `plan.md`, `Research` → `research.md`, `Summary` → `summary.md`, `Review` → `review.md` (all under FEATURE_DIR). Verify each target file exists.

### Step 3: Apply each comment

For each comment block:
1. Read the target artifact file
2. Find the section matching the heading (markdown headings `#`/`##`/`###` containing the heading text)
3. Rewrite that section's content to address the feedback
4. Preserve all other sections unchanged
5. Write the updated file

**Rules**:
- Only modify the specific section referenced — preserve heading itself, only change body
- Maintain document structure, formatting, and heading hierarchy
- Unmatched sections go to the unmatched list (do not error)
- Apply all comments for one file before moving to the next

### Step 4: Report results

```markdown
## Comments Applied

- [Spec] > User Stories: ✓ Updated
- [Plan] > Technical Approach: ✓ Updated
- [Plan] > Summary: ✗ Section not found — skipped

**Files modified**: spec.md, plan.md
```

If any comments could not be matched, explain why.

**Status Signal**: Run `bash .claude/specify/scripts/bash/teardown-phase.sh --command "spec.comments" --json` to signal command completion.
