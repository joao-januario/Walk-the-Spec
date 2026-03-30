---
description: Review the current branch against best practices for the underlying technologies. Produces a structured findings report with severity, location, and recommendations.
---

## User Input

```text
$ARGUMENTS
```

Consider user input before proceeding.

**Status Signal**: Run `bash .claude/specify/scripts/bash/bootstrap-phase.sh --command "spec.review" --phase review --json` to signal command start.

## Goal

Analyze all code changes on the current branch (vs base branch) against `.claude/best-practices/`. Default mode is **inline review** (orchestrator does everything). Sub-agents are only spawned for genuinely massive branches (>50 files AND >2000 diff lines). This command is **read-only**.

## Severity Categories

| Category | Meaning | Merge Blocking? |
|----------|---------|-----------------|
| **NEEDS_REFACTOR** | Architectural issue spanning large codebase dimensions. Tracked in `.claude/specs/refactor-backlog.md`. | No |
| **CRITICAL** | MUST fix before merge. Security vulnerability or severely broken implementation. | Yes |
| **HIGH** | Severe best practices breakage. Unmaintainable code. | Strongly recommended |
| **MEDIUM** | Law of Demeter violations, minor duplication, missing non-critical error handling. | Optional |
| **LOW** | Nits — naming, formatting, style. | Optional |

## Execution Steps

### Phase 1: Branch Context Analysis

Run in a single Bash call:
```bash
git rev-parse --abbrev-ref HEAD
git merge-base HEAD main
git diff --name-only $(git merge-base HEAD main)..HEAD
git diff --stat $(git merge-base HEAD main)..HEAD
```

Extract CURRENT_BRANCH, BASE_BRANCH (default `main`), CHANGED_FILES, DIFF_STATS. If no changed files, report "No changes to review" and exit.

### Phase 1.5: Cross-File Impact Analysis

From the `git diff --name-only` output in Phase 1, identify files that export public APIs (functions, types, classes). For each, run ONE targeted Grep for the exported identifier to find dependents not in the diff. That is the only exploration allowed.

**PROHIBITED**: Reading files not in the diff or grep results. Running Glob. Running broad Grep patterns like `import.*` or `from.*`. Spawning agents to "explore the codebase." You have the complete diff — that is your input, not a starting point for exploration.

### Phase 2: Classify Into Verticals & Load Best Practices

Group changed files by vertical. **Only load best practices docs relevant to verticals with changed files.**

Also load `.claude/specify/memory/constitution.md` for Design Philosophy.

| Vertical | File Patterns | Best Practices Docs |
|----------|--------------|---------------------|
| **Electron Main** | `src/main/**/*.ts` | electron-security.md, electron-architecture.md, typescript-strict.md |
| **Electron Preload** | `src/preload/**/*.ts` | electron-security.md |
| **Renderer (React)** | `src/renderer/**/*.tsx`, `*.ts` | react-typescript.md, typescript-strict.md, tailwind.md |
| **Renderer CSS** | `src/renderer/**/*.css` | tailwind.md |
| **Tests** | `tests/**/*.test.ts` | testing.md, typescript-strict.md |
| **Config/Build** | `tsconfig*.json`, `electron.vite.config.*`, `vitest.config.*`, `package.json` | typescript-strict.md, electron-architecture.md |

Rules: files may appear in multiple verticals; only create verticals with changed files; merge small verticals (1-2 files) into related ones; collect unmatched files into "Not Reviewed".

### Phase 2.5: Inline vs Sub-Agent Decision

Count changed **source files** (excluding `.claude/specs/`, `.md`, `package-lock.json`). Also run `git diff --stat $(git merge-base HEAD main)..HEAD` and note total lines changed.

**Decision matrix** (check in order):
1. If **<= 50 source files OR <= 2000 diff lines**: review ALL diffs yourself inline. Use `git diff` to read diffs per file, check against best practices rules loaded in Phase 2. Do NOT spawn sub-agents. Continue to Phase 4.
2. If **> 50 source files AND > 2000 diff lines**: proceed to Phase 3 (sub-agent delegation for genuinely massive branches only).

File count alone is a poor proxy — 50 small test files is less work than 20 dense infrastructure files. Both thresholds must be exceeded.

### Phase 3: Delegate to Sub-Agents (large branches only)

> Skip if Phase 2.5 applied (most branches).

#### Phase 3a: Pre-compute diffs (orchestrator does this BEFORE spawning agents)

Run `git diff $(git merge-base HEAD main)..HEAD -- <file>` for every file in each vertical. Collect the diff output. This is done once, in the orchestrator, to avoid each sub-agent repeating the same tool calls.

#### Phase 3b: Spawn sub-agents

For each vertical, spawn a **Haiku sub-agent** (Agent tool, `model: "haiku"`). Launch ALL in parallel.

Each sub-agent prompt MUST include:
- Vertical name
- The **pre-computed diffs** for assigned files (embedded inline in the prompt)
- Relevant best-practices file paths (NOT full content — sub-agents read these themselves)

Sub-agent instructions:

```
You are an engineering reviewer. Your assigned diffs are provided inline below — do NOT run git diff yourself.
Read only the best-practices files listed. Use Grep for targeted lookups if needed.
**FORBIDDEN**: Reading any file not in your assigned list. Running Glob. Running broad Grep. "Exploring" the codebase. You have everything you need — if something seems missing, flag it as a finding, do not go hunting.

For each violation report: Rule ID, Category, File:line, Summary, Why, What you gain.

Detection: Only flag added/modified lines. Be thorough. NEEDS_REFACTOR only for multi-file scope.
```

### Phase 4: Consolidate & Validate

Gather all findings, deduplicate by file:line, validate (rule ID exists, file:line real, category appropriate, discard hallucinations), review proposed fixes, identify cross-vertical patterns.

### Phase 5: Produce Final Report

Output Markdown report with: branch metadata, summary table (counts per category), findings section, cross-vertical observations, files not reviewed.

**spec-board's parser is strict — use this EXACT format for the findings section:**

```markdown
### Findings

#### Finding #1: RULEID — One-line summary of the issue

**Severity**: CRITICAL
**Location**: path/to/file.ts:LINE
**Rule**: RULEID

**Why this severity**: Explanation of why this severity level is warranted...

**What you gain**: What concretely improves when this is fixed...

```typescript
// offending code snippet
```

```typescript
// proposed fix snippet
```

#### Finding #2: RULEID — ...
```

Critical constraints:
- Section heading must be **exactly** `### Findings`
- Finding heading must be **exactly** `#### Finding #N: RULEID — Summary` — four `#`, the word `Finding`, `#` before the number, colon, rule ID, then `—` (or `–` or `-`), then summary
- Field labels must be **exactly** `**Severity**:`, `**Location**:`, `**Rule**:`, `**Why this severity**:`, `**What you gain**:`
- NEEDS_REFACTOR findings go in the **same** `### Findings` section, not a separate one
- Code blocks for "offending" and "proposed fix" are optional but encouraged for CRITICAL/HIGH

### Phase 6: Write Review Artifact

Write the **complete** report to `.claude/specs/<BRANCH_NAME>/review.md` using the **Write tool** (not Edit). If the file already exists, replace it entirely — do NOT preserve any prior `## Heal Summary` section from a previous heal run, as stale heal statuses would incorrectly mark new findings as FIXED.

### Phase 7: Record NEEDS_REFACTOR

Append NEEDS_REFACTOR findings to `.claude/specs/refactor-backlog.md`: `| RO-NNN | branch-name | RULE_ID | file(s) | description | Open |`. Continue numbering, no duplicates.

### Phase 8: Next Actions

- CRITICAL: "**BLOCKED**: Resolve CRITICAL findings before merging."
- HIGH only: "Branch mergeable but HIGH findings strongly recommended for fixing."
- MEDIUM/LOW only: "Branch is clean. Consider addressing MEDIUM findings."
- NEEDS_REFACTOR: "Architectural debt recorded in refactor-backlog.md."
- None: "Branch passes all best practices checks."

### Phase 9: Suggest Next Step

Output: "Run `/spec.heal` to apply fixes."

If no actionable findings: "No fixes needed. Run `/spec.conclude` to finalize."

**IMPORTANT**: `/spec.review` is strictly read-only. It MUST NOT modify source files. All fixes via `/spec.heal`.

**Status Signal**: Run `bash .claude/specify/scripts/bash/teardown-phase.sh --command "spec.review" --json` to signal command completion.

## Operating Principles

- **Orchestrator-first** — do the review yourself inline for branches ≤ 50 files / ≤ 2000 diff lines. Sub-agents are a last resort for genuinely massive branches, not the default. When in doubt, stay inline — cold-start overhead of multiple sub-agents often exceeds the cost of sequential inline review.
- **Pre-compute, don't delegate reads** — the orchestrator pre-computes diffs and embeds them in sub-agent prompts. Sub-agents are FORBIDDEN from running git diff, Glob, or broad Grep — they receive everything they need. If a sub-agent needs more context, that means the orchestrator prompt was incomplete — fix the prompt, not the sub-agent's permissions. Best-practices files are the exception: pass paths only, sub-agents read those themselves (they're static and small).
- **Only review changed code** — pre-existing issues out of scope.
- **Thorough over fast** — check every rule against every changed line.
- **Critical thinking** — flag real problems, not theoretical concerns.
- **NEVER modify files** — review is read-only.
