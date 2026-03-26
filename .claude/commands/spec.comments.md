---
description: Apply clipboard-pasted section comments to artifact files by rewriting the targeted sections.
model: sonnet
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

**Status Signal**: Run `bash .claude/specify/scripts/bash/check-prerequisites.sh --json --paths-only` from repo root and parse JSON for FEATURE_DIR, FEATURE_SPEC.

## Outline

Apply structured section comments (pasted from the Walk the Spec app clipboard) to the appropriate artifact files.

### Step 1: Parse the comment input

The user's input (`$ARGUMENTS`) contains structured comment blocks in this format:

```
[DocType] > Section Heading:
comment text here

[DocType] > Another Section:
more feedback
```

Parse each block:
1. Split on blank lines to get individual blocks
2. For each block, match the first line against the pattern: `[DocType] > Section Heading:`
3. Extract: doc type (Spec, Plan, Research, Summary, Review), section heading (verbatim), and comment text (remaining lines)

If the input is empty or cannot be parsed, ERROR: "No comment blocks found. Copy comments from the app first, then paste them as input to this command."

### Step 2: Locate artifact files

Run `bash .claude/specify/scripts/bash/check-prerequisites.sh --json --paths-only` to get FEATURE_DIR.

Map doc types to files:
- `Spec` → `FEATURE_DIR/spec.md`
- `Plan` → `FEATURE_DIR/plan.md`
- `Research` → `FEATURE_DIR/research.md`
- `Summary` → `FEATURE_DIR/summary.md`
- `Review` → `FEATURE_DIR/review.md`

For each doc type referenced in the comments, verify the target file exists.

### Step 3: Apply each comment

For each comment block:
1. Read the target artifact file
2. Find the section matching the heading (look for markdown headings: `#`, `##`, `###`, etc. that contain the heading text)
3. Rewrite that section's content to address the feedback in the comment
4. Preserve all other sections unchanged
5. Write the updated file

**Rules**:
- Only modify the specific section referenced by each comment
- Preserve the heading itself — only change the section body
- Maintain the document's overall structure, formatting, and heading hierarchy
- If a section cannot be found, add it to the unmatched list (do not error)
- Apply comments in file order (all comments for one file before moving to the next)

### Step 4: Report results

Report which comments were applied and which could not be matched:

```markdown
## Comments Applied

- [Spec] > User Stories: ✓ Updated
- [Plan] > Technical Approach: ✓ Updated
- [Plan] > Summary: ✗ Section not found — skipped

**Files modified**: spec.md, plan.md
```

If any comments could not be matched, explain why (section heading not found, file missing, etc.).

**Status Signal**: Run `bash .claude/specify/scripts/bash/teardown-phase.sh --command "spec.comments" --json` to signal command completion.
