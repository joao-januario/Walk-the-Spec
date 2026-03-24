---
description: Review the current branch against best practices for the underlying technologies. Produces a structured findings report with severity, location, and recommendations.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Goal

Analyze all changes in the current branch (compared to the base branch) against the best practices documents in `.claude/best-practices/`. Use a **multi-agent architecture**: perform an overall branch analysis yourself, then spawn parallel Haiku sub-agents for each technology vertical, and finally consolidate their findings into a unified review report. This command is **read-only** — it does not modify any files.

## Operating Constraints

**STRICTLY READ-ONLY**: Do **not** modify any files. Output a structured review report. Offer an optional fix plan (user must explicitly approve before any edits).

**Best Practices Authority**: The best practices documents in `.claude/best-practices/` are the authoritative rule set. Every finding must reference a specific rule ID (e.g., R01, TW04, EX03). Do not invent rules that are not in the documents. Do not skip rules that apply.

**Multi-Agent**: You are the orchestrator. You perform high-level analysis and delegate detailed per-vertical review to Haiku sub-agents. You then review, validate, and consolidate their findings.

## Execution Steps

### Phase 1: Branch Context Analysis (You — Orchestrator)

Run the following commands to understand the branch state:

```bash
git rev-parse --abbrev-ref HEAD
git merge-base HEAD main
git diff --name-only $(git merge-base HEAD main)..HEAD
git diff --stat $(git merge-base HEAD main)..HEAD
```

Extract:
- **CURRENT_BRANCH**: The active branch name
- **BASE_BRANCH**: `main` (or override via `$ARGUMENTS` if user specifies a different base)
- **CHANGED_FILES**: List of all files added, modified, or deleted in this branch
- **DIFF_STATS**: Summary of insertions/deletions

If no changed files exist, report "No changes to review" and exit.

### Phase 2: Classify Into Verticals (You — Orchestrator)

Group the changed files into **technology verticals**. Each vertical is a coherent review unit that will be assigned to one Haiku sub-agent. Use the mapping below to determine which best practices documents apply to each vertical:

| Vertical Name | File Patterns | Best Practices Documents |
|---|---|---|
| **Frontend (React/Tailwind/shadcn)** | `*.tsx`, `*.jsx`, `*.ts` in `src/web/`, `*.css` | react.md, typescript.md, tailwind.md, shadcn.md |
| **Backend (Express/WebSocket)** | `*.ts` in `src/server/`, files with `ws`/`WebSocket` imports | express.md, websocket.md, typescript.md |
| **Data (SQLite)** | `*.sql`, `**/db*`, `**/database*`, `**/migration*` | sqlite.md |
| **Parser** | `*.ts` in `src/parser/` | typescript.md |
| **Build/Config** | `vite.config.*`, `tsconfig*`, `.env*` | vite.md, typescript.md, express.md |
| **File Watching** | Files with `chokidar` imports | chokidar.md |
| **Dependencies** | `package.json` | (check dependency changes against all applicable documents) |

**Rules for vertical assignment:**
- A file may appear in multiple verticals if it touches multiple concerns (e.g., a component that imports WebSocket)
- Only create verticals that have at least one changed file — skip empty verticals
- If a vertical has only 1-2 small files, consider merging it into a related vertical to avoid unnecessary sub-agent overhead
- Files that match no pattern are collected into a "Not Reviewed" list

Output a brief summary to the user: which verticals were identified, how many files each contains, and which best practices documents apply.

### Phase 3: Spawn Haiku Sub-Agents (You — Orchestrator)

For each vertical identified in Phase 2, spawn a **Haiku sub-agent** using the Agent tool with `model: "haiku"`. Launch all sub-agents **in parallel** (a single message with multiple Agent tool calls).

Each sub-agent prompt **MUST** include:

1. **The vertical name and scope** — which files to review
2. **The full git diffs** for the files in that vertical — obtain these via `git diff $(git merge-base HEAD main)..HEAD -- <file>` before spawning, and include the diff output directly in the prompt so the sub-agent doesn't need git access
3. **The full content of each applicable best practices document** — read the `.claude/best-practices/*.md` files and include their content directly in the prompt
4. **Clear instructions** on what to do:

```
You are a code reviewer. Analyze the provided git diffs against the provided best practices rules.

For each violation found:
1. Rule ID (e.g., R01, TW04)
2. Severity: HIGH (MUST rule violation) or MEDIUM (SHOULD rule violation)
3. File and line number where the violation occurs
4. Summary of the issue
5. Recommendation from the rule's Correct pattern
6. Proposed fix: show the current code and what it should be changed to

Detection guidelines:
- Only flag violations in added/modified lines (lines starting with + in the diff)
- Do not flag pre-existing issues in unchanged code
- If a rule's Detect instruction says "grep for X", search the changed code
- If a violation is ambiguous (could be intentional), mark it as "Needs Confirmation"
- Respect intentional patterns — if code has // PERF:, // CUSTOM:, or similar justification comments, acknowledge them
- Be precise, not exhaustive — flag real violations, not stylistic preferences outside the rule set

Output your findings as a structured list. If no violations are found, state that explicitly.
```

**Important**: Do NOT have sub-agents read files or run commands. Provide all necessary context (diffs + rules) directly in the prompt to minimize sub-agent tool usage and maximize speed.

### Phase 4: Consolidate & Validate (You — Orchestrator)

Once all Haiku sub-agents return their findings:

1. **Gather** all findings from all verticals into a single list
2. **Deduplicate** — if the same file appeared in multiple verticals, merge findings and remove duplicates
3. **Validate** each finding:
   - Does the cited rule ID actually exist in the best practices documents?
   - Is the file:line reference plausible given the diff?
   - Is the severity correctly mapped (MUST → HIGH, SHOULD → MEDIUM)?
   - Discard any finding that fails validation (hallucinated rule, wrong file, etc.)
4. **Review proposed fixes** — check that each sub-agent's proposed fix is correct and doesn't introduce new issues. Adjust if needed.
5. **Dependency-chain safety** — For any R01 finding that proposes removing `useCallback` or `useMemo`:
   - Check if the function name appears in a dependency array (`[..., functionName]`) of another `useCallback`, `useMemo`, or `useEffect` in the same file
   - If it does, reclassify the finding as **REFACTOR** severity — the memoization is a workaround for tight coupling via dependency chains. It cannot be safely removed without restructuring the hook. Include a note explaining the chain and what a proper refactor would look like (e.g., consolidating the functions, using a reducer, or restructuring to break the dependency chain).
   - REFACTOR findings MUST NOT be auto-fixed. They appear in the report for visibility but are excluded from the "Proposed Fixes" section.
6. **Cross-vertical insights** — identify any patterns that span verticals (e.g., same anti-pattern repeated across frontend and backend) and add a note

### Phase 5: Produce Final Report (You — Orchestrator)

Output a Markdown report with the following structure:

```
## Branch Review Report

**Branch**: CURRENT_BRANCH
**Base**: BASE_BRANCH
**Files Changed**: N
**Files Reviewed**: N (of N)
**Verticals Reviewed**: list of vertical names

### Summary

| Severity | Count |
|----------|-------|
| HIGH (MUST violations) | N |
| MEDIUM (SHOULD violations) | N |
| REFACTOR (Architectural debt) | N |
| INFO (Recommendations) | N |

### Findings

| # | Rule | Severity | File:Line | Summary | Recommendation |
|---|------|----------|-----------|---------|----------------|
| 1 | R01 | HIGH | src/web/src/App.tsx:42 | useMemo without PERF justification | Remove useMemo — React Compiler handles this |
| 2 | TW04 | HIGH | src/web/src/components/Sidebar.tsx:18 | Template literal for Tailwind classes | Use cn() utility |

### Proposed Fixes

For each HIGH and MEDIUM finding, show:

#### Finding #N: Rule ID — Summary

**File**: path/to/file.ts:line

**Current code:**
\`\`\`typescript
// the anti-pattern code from the diff
\`\`\`

**Proposed fix:**
\`\`\`typescript
// the corrected code
\`\`\`

**Rule reference**: Brief explanation from the best practices document

---

### Cross-Vertical Observations

(Any patterns, themes, or systemic issues that span multiple verticals)

### Files Not Reviewed

| File | Reason |
|------|--------|
| ... | No matching best practices document |

### Coverage

| Document | Rules Checked | Violations | Vertical |
|----------|--------------|------------|----------|
| react.md | 12 | 2 | Frontend |
| tailwind.md | 10 | 1 | Frontend |
| express.md | 11 | 0 | Backend |
```

### Phase 6: Record Refactor Opportunities

If any REFACTOR findings exist, append them to `.claude/docs/refactor-opportunities.md`. Each entry should have:
- A sequential ID (RO-001, RO-002, etc.) — continue from the last existing ID in the file
- The branch name where it was discovered
- The rule ID that flagged it
- The file and line(s) affected
- A brief description of the architectural debt and possible resolution approaches

Create the file if it doesn't exist. Do not duplicate entries that already exist for the same file+rule combination.

### Phase 7: Next Actions

At end of report, output a concise Next Actions block:

- If HIGH findings exist: "Resolve HIGH findings before merging. These are MUST rules — violations indicate bugs, security issues, or significant quality problems."
- If only MEDIUM findings: "Branch is mergeable. Consider addressing MEDIUM findings for code quality."
- If REFACTOR findings exist (with or without MEDIUM): "REFACTOR findings indicate architectural debt — consider addressing in a dedicated refactoring PR. They do NOT block merging."
- If no findings: "Branch passes all applicable best practices checks."

### Phase 8: Offer Fix Application

Ask the user: "Would you like me to apply the proposed fixes?" (Do NOT apply them automatically.)

If the user approves:
1. Show a summary of all fixes that will be applied
2. Wait for explicit confirmation
3. Apply fixes one file at a time, showing a before/after for each
4. After ALL fixes are applied, run existing tests to verify no regressions:
   - Run `npm run typecheck` (type safety)
   - Run `npm run test:unit` if unit tests exist (logic correctness)
   - Run `npx playwright test` if E2E tests exist (integration correctness)
   Note: Run tests ONCE after all fixes are applied, not after each individual fix.
5. If any test fails after applying fixes:
   - Report the failure to the user
   - Identify which fix likely caused the failure
   - Revert that fix and mark the finding as "Fix requires manual intervention"
6. Report final status — which fixes were applied successfully and which (if any) were reverted

## Operating Principles

### Orchestrator Guidelines

- **You are the quality gate** — sub-agents may hallucinate rules or misidentify violations. You MUST validate every finding before including it in the final report.
- **Provide complete context to sub-agents** — diffs and rule documents must be included directly in the prompt. Sub-agents should not need to read files or run commands.
- **Parallelize aggressively** — all sub-agents for all verticals should be spawned in a single message.
- **Be transparent** — tell the user which verticals you identified and when sub-agents are working.

### Analysis Guidelines

- **NEVER modify files** during review (this is read-only analysis until user approves fixes)
- **NEVER include unvalidated findings** — every finding in the final report must pass your validation
- **Only review changed code** — pre-existing issues in unchanged files are out of scope
- **Cite specific lines** — every finding must reference a file and line number
- **Be precise, not exhaustive** — flag real violations, not stylistic preferences outside the rule set
- **Respect intentional patterns** — if code has a `// PERF:`, `// CUSTOM:`, or similar justification comment, acknowledge it

### Context Efficiency

- Load only applicable best practices documents (not all 9)
- Read only changed files (not the entire codebase)
- Use git diff for targeted analysis (not full file reads)
- Limit findings to 50 total; summarize overflow
- Sub-agents receive pre-loaded context — no redundant file reads
