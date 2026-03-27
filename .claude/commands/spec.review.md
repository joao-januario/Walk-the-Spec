---
description: Review the current branch against best practices for the underlying technologies. Produces a structured findings report with severity, location, and recommendations.
model: sonnet
---

## User Input

```text
$ARGUMENTS
```

Consider user input before proceeding.

**Status Signal**: Run `bash .claude/specify/scripts/bash/bootstrap-phase.sh --command "spec.review" --phase review --json` to signal command start.

## Goal

Analyze all code changes on the current branch (vs base branch) against `.claude/best-practices/`. Use **multi-agent architecture**: perform overall branch analysis yourself, spawn parallel Haiku sub-agents per technology vertical, then consolidate into a unified review report. This command is **read-only**.

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

If `.claude/specify/context/repo-map.md` exists, read it to understand the structural context of changed files — identify what they import and export, and which nearby modules may be affected. Flag changed exports where related modules are not in the diff as cross-file impact risks.

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

### Phase 2.5: Small Branch Optimization

Count changed **source files** (excluding `.claude/specs/`, `.md`, `package-lock.json`).

If <= 5 source files AND <= 2 verticals: **skip Phase 3**, review diffs yourself inline, continue to Phase 4.

### Phase 3: Spawn Haiku Sub-Agents

> Skip if Phase 2.5 applied.

For each vertical, spawn a **Haiku sub-agent** (Agent tool, `model: "haiku"`). Launch ALL in parallel.

Each sub-agent prompt MUST include: vertical name + file list, full git diffs for the vertical's files (pre-fetched), only relevant best practices docs, and these instructions:

```
You are an engineering reviewer. Analyze diffs against best practices rules with critical thinking.

For each violation report: Rule ID, Category (NEEDS_REFACTOR/CRITICAL/HIGH/MEDIUM/LOW), File:line, Summary, Why this severity (concrete risk/impact), What you gain (concrete benefit), Code snippets (when helpful).

Detection: Only flag added/modified lines. Follow each rule's "Detect" instructions. Mark ambiguous violations "Needs Confirmation". Be thorough — check every rule against every changed line. Think critically. NEEDS_REFACTOR only for multi-file/module scope fixes.

Output structured list. If no violations, state explicitly.
```

### Phase 4: Consolidate & Validate

Gather all findings, deduplicate by file:line, validate (rule ID exists, file:line real, category appropriate, discard hallucinations), review proposed fixes, identify cross-vertical patterns.

### Phase 5: Produce Final Report

Output Markdown report with: branch metadata, summary table (counts per category), findings (each with severity, location, rule, why, gain, code snippets), cross-vertical observations, files not reviewed.

### Phase 6: Write Review Artifact

Write report to `.claude/specs/<BRANCH_NAME>/review.md`. If exists (re-review), overwrite and note "Re-reviewed on YYYY-MM-DD".

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

- **Orchestrator validates everything** — sub-agents may hallucinate; discard invalid findings.
- **Provide complete context** — diffs and rules go directly in sub-agent prompts.
- **Parallelize** — all sub-agents launched in one message.
- **Only review changed code** — pre-existing issues out of scope.
- **Thorough over fast** — check every rule against every changed line.
- **Critical thinking** — flag real problems, not theoretical concerns.
- **NEVER modify files** — review is read-only.
