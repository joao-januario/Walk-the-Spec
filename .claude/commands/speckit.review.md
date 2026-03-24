---
description: Review the current branch against best practices for the underlying technologies. Produces a structured findings report with severity, location, and recommendations.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Goal

Analyze all code changes on the current branch (compared to the base branch) against the best practices documents in `.claude/best-practices/`. Use a **multi-agent architecture**: perform an overall branch analysis yourself, then spawn parallel Haiku sub-agents for each technology vertical, and finally consolidate their findings into a unified engineering review report. This command is **read-only** — it does not modify any files.

## Severity Categories

Findings MUST be assigned one of these 5 categories:

| Category | Meaning | Merge Blocking? |
|----------|---------|-----------------|
| **NEEDS_REFACTOR** | Architectural issue spanning large dimensions of the codebase. Out of scope for this branch but must be tracked. Appended to `.claude/specs/refactor-backlog.md`. | No — tracked separately |
| **CRITICAL** | Branch MUST NOT be merged without fixing. Severe issue, security vulnerability, or amateur-like implementation. | Yes — blocks merge |
| **HIGH** | Severe breakage of best practices. Unmaintainable code. Strongly recommend fixing before merge. | Strongly recommended |
| **MEDIUM** | Law of Demeter violations, minor code duplication, missing error handling on non-critical paths. | Optional |
| **LOW** | Minor nits — naming, formatting, style preferences within the rule set. | Optional |

## Execution Steps

### Phase 1: Branch Context Analysis (Orchestrator)

Run the following to understand the branch state:

```bash
git rev-parse --abbrev-ref HEAD
git merge-base HEAD main
git diff --name-only $(git merge-base HEAD main)..HEAD
git diff --stat $(git merge-base HEAD main)..HEAD
```

Extract:
- **CURRENT_BRANCH**: The active branch name
- **BASE_BRANCH**: `main` (or override via user input)
- **CHANGED_FILES**: All files added, modified, or deleted
- **DIFF_STATS**: Summary of insertions/deletions

If no changed files exist, report "No changes to review" and exit.

### Phase 2: Load Best Practices & Classify Into Verticals (Orchestrator)

Read ALL documents from `.claude/best-practices/`:
- `electron-security.md` — ES01-ES10
- `electron-architecture.md` — EA01-EA10
- `react-typescript.md` — RT01-RT14
- `typescript-strict.md` — TS01-TS13
- `testing.md` — TT01-TT11

Also load `.claude/specify/memory/constitution.md` for the Design Philosophy principles.

Group changed files into technology verticals:

| Vertical | File Patterns | Best Practices Docs |
|----------|--------------|---------------------|
| **Electron Main** | `src/main/**/*.ts` | electron-security.md, electron-architecture.md, typescript-strict.md |
| **Electron Preload** | `src/preload/**/*.ts` | electron-security.md |
| **Renderer (React)** | `src/renderer/**/*.tsx`, `src/renderer/**/*.ts` | react-typescript.md, typescript-strict.md |
| **Tests** | `tests/**/*.test.ts` | testing.md, typescript-strict.md |
| **Config/Build** | `tsconfig*.json`, `electron.vite.config.*`, `vitest.config.*`, `package.json` | typescript-strict.md, electron-architecture.md |

Rules:
- A file may appear in multiple verticals
- Only create verticals with at least one changed file
- Merge small verticals (1-2 files) into a related one
- Collect unmatched files into "Not Reviewed" list

### Phase 3: Spawn Haiku Sub-Agents (Orchestrator)

For each vertical, spawn a **Haiku sub-agent** using the Agent tool with `model: "haiku"`. Launch ALL sub-agents **in parallel** (single message, multiple Agent tool calls).

Each sub-agent prompt MUST include:

1. **The vertical name and file list**
2. **The full git diffs** for the vertical's files — run `git diff $(git merge-base HEAD main)..HEAD -- <file>` BEFORE spawning and include the output directly
3. **The full content of each applicable best practices document** — read them and include directly
4. **Clear instructions**:

```
You are an engineering reviewer. Analyze the provided git diffs against the provided best practices rules with critical thinking.

For each violation found, report:
1. Rule ID (e.g., ES01, RT03, TS05)
2. Category: NEEDS_REFACTOR / CRITICAL / HIGH / MEDIUM / LOW
   - NEEDS_REFACTOR: Architectural issue too large for this branch, needs dedicated refactor
   - CRITICAL: Must fix before merge. Security issue, data loss risk, or severely broken implementation.
   - HIGH: Severe best practices violation. Unmaintainable or unreliable code.
   - MEDIUM: Minor best practices violation. Law of Demeter, duplication, missing non-critical error handling.
   - LOW: Nits. Naming, formatting, style.
3. File and line number
4. Summary of the issue
5. Proposed fix: show current code and what it should be changed to

Detection guidelines:
- Only flag violations in added/modified lines (+ lines in the diff)
- Do NOT flag pre-existing issues in unchanged code
- Follow each rule's "Detect" instructions precisely
- If a violation is ambiguous or could be intentional, mark as "Needs Confirmation"
- Be thorough — check every rule against every changed line. Miss nothing.
- Think critically — is this genuinely a problem or acceptable in context?
- For NEEDS_REFACTOR: only use when the fix would require changes spanning multiple files/modules beyond this branch's scope

Output findings as a structured list. If no violations found, state that explicitly.
```

### Phase 4: Consolidate & Validate (Orchestrator)

Once all sub-agents return:

1. **Gather** all findings into a single list
2. **Deduplicate** findings on the same file:line
3. **Validate** each finding:
   - Does the cited rule ID exist in the best practices docs?
   - Is the file:line reference real?
   - Is the category appropriately assigned?
   - Discard hallucinated or invalid findings
4. **Review proposed fixes** — check they're correct and don't introduce new issues
5. **Cross-vertical observations** — identify patterns spanning multiple verticals

### Phase 5: Produce Final Report (Orchestrator)

Output a Markdown report:

```markdown
## Branch Engineering Review

**Branch**: CURRENT_BRANCH
**Base**: BASE_BRANCH
**Files Changed**: N
**Files Reviewed**: N (of N)
**Verticals**: list

### Summary

| Category | Count |
|----------|-------|
| NEEDS_REFACTOR | N |
| CRITICAL | N |
| HIGH | N |
| MEDIUM | N |
| LOW | N |

### Findings

| # | Rule | Category | File:Line | Summary | Fix |
|---|------|----------|-----------|---------|-----|
| 1 | ES04 | CRITICAL | src/preload/index.ts:5 | Raw ipcRenderer exposed | Wrap in named functions |

### Proposed Fixes

For each CRITICAL and HIGH finding:

#### Finding #N: Rule ID — Summary

**File**: path:line

**Current:**
\`\`\`typescript
// problematic code
\`\`\`

**Proposed:**
\`\`\`typescript
// fixed code
\`\`\`

**Rule reference**: Brief explanation

---

### Cross-Vertical Observations

(Patterns or systemic issues spanning verticals)

### Files Not Reviewed

| File | Reason |
|------|--------|
| ... | No matching vertical |
```

### Phase 6: Write Review Artifact

Write the full report to `.claude/specs/<BRANCH_NAME>/review.md`. This persists the review as part of the branch's artifact trail alongside spec.md, plan.md, tasks.md, etc.

The file should contain the complete report (summary table, all findings, proposed fixes, cross-vertical observations). It is cleaned up when `/speckit.conclude` deletes the branch artifacts.

If the file already exists (re-review), overwrite it with the new report and note "Re-reviewed on YYYY-MM-DD" at the top.

### Phase 7: Record NEEDS_REFACTOR (project-level)

For any NEEDS_REFACTOR findings, append entries to `.claude/specs/refactor-backlog.md`:

```markdown
| RO-NNN | branch-name | RULE_ID | file(s) | description | Open |
```

Continue numbering from the last existing ID. Do not duplicate existing entries for the same file+rule.

### Phase 8: Next Actions

- If CRITICAL findings exist: "**BLOCKED**: Resolve CRITICAL findings before merging."
- If only HIGH: "Branch is mergeable but HIGH findings strongly recommended for fixing."
- If only MEDIUM/LOW: "Branch is clean. Consider addressing MEDIUM findings."
- If NEEDS_REFACTOR: "Architectural debt recorded in refactor-backlog.md for future work."
- If no findings: "Branch passes all best practices checks."

### Phase 9: Suggest Next Step

Output: "Run `/speckit.heal` to apply the proposed fixes for CRITICAL and HIGH findings."

If no CRITICAL or HIGH findings exist: "No fixes needed. Run `/speckit.conclude` to finalize the branch."

**IMPORTANT**: `/speckit.review` is strictly read-only. It MUST NOT modify any source files. All fixes are applied by `/speckit.heal`.

## Operating Principles

- **Orchestrator validates everything** — sub-agents may hallucinate. Discard invalid findings.
- **Provide complete context** — diffs and rules go directly in sub-agent prompts. Sub-agents should not need to read files.
- **Parallelize** — all sub-agents launched in one message.
- **Only review changed code** — pre-existing issues are out of scope.
- **Be thorough over fast** — check every rule against every changed line.
- **Critical thinking** — flag real problems, not theoretical concerns.
- **NEVER modify files** — review is read-only. Fixes are applied by `/speckit.heal`.
