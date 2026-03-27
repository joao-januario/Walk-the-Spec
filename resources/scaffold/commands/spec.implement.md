---
description: Execute the implementation plan by deriving tasks from plan.md artifacts and implementing them in priority order.
---

## User Input

```text
$ARGUMENTS
```

Consider user input before proceeding.

## Pre-Execution Checks

**Bootstrap**: Run `bash .claude/specify/scripts/bash/bootstrap-phase.sh --command "spec.implement" --phase implement --json` from repo root and parse JSON for FEATURE_DIR, AVAILABLE_DOCS, HAS_EXTENSIONS. All paths must be absolute.

## Outline

1. **Load context**: Read plan.md, spec.md, and all available design artifacts (research.md, data-model.md, contracts/, quickstart.md) — always load these if they exist. For **source code** navigation during implementation, consult `.claude/specify/context/repo-map.md` to identify relevant modules and files before exploring the codebase. If repo-map.md is missing, warn the user — it should have been generated when the project was added. When spawning sub-agents for implementation tasks, include in each prompt: 'Read .claude/specify/context/repo-map.md and use Grep for targeted searches instead of reading full source files.'

2. **Check checklists status** (if FEATURE_DIR/checklists/ exists):
   - Scan all checklist files, count items matching `- [ ]` / `- [X]` / `- [x]`
   - Display status table: `| Checklist | Total | Completed | Incomplete | Status |`
   - **PASS** = all 0 incomplete; **FAIL** = any incomplete
   - If incomplete: STOP, ask user to proceed or halt
   - If all complete: auto-proceed

3. **Generate execution plan** from plan.md. Order: infrastructure/setup → foundational components → user stories by priority → polish.

4. **Project Setup Verification** — create/verify ignore files based on project setup:

   **Detection**: Check for git repo (`git rev-parse --git-dir`), Dockerfile, .eslintrc*, eslint.config.*, .prettierrc*, .npmrc/package.json, *.tf, helm charts. Create/verify corresponding ignore files (.gitignore, .dockerignore, .eslintignore, .prettierignore, .npmignore, .terraformignore, .helmignore).

   - If ignore file exists: append missing critical patterns only
   - If missing: create with standard patterns for the detected technology stack
   - Include universal patterns: `.DS_Store`, `Thumbs.db`, `*.tmp`, `*.swp`, `.vscode/`, `.idea/`
   - Include tool-specific patterns (Docker, ESLint, Prettier, Terraform, K8s) as appropriate

5. **Execute implementation** following the plan:
   - Phase-by-phase: complete each before moving to next
   - **TDD is mandatory**: For every user story, write tests FIRST. Run them. Confirm they FAIL. Only then write the implementation to make them pass. Do NOT write implementation code without a failing test. This is non-negotiable — no exceptions, no "this is hard to test" excuses, no skipping for "thin wrappers" or "event wiring." If it's code, it gets a test first.
   - File-based coordination: same-file tasks run sequentially
   - Validation checkpoints at each phase boundary

6. **Execution order**: Setup → **failing tests** → implementation to make them pass → integration → polish/validation

7. **Progress tracking**: Report per phase. Halt on critical failure. Provide clear errors with debugging context.

8. **Completion validation**: Verify all tasks complete, features match spec, tests pass with coverage, implementation follows plan.

9. **Generate implementation summary** (if not already present):
   - If `summary.md` exists in FEATURE_DIR: skip
   - Otherwise: Read template from `.claude/specify/templates/summary-template.md` and follow its structure EXACTLY
   - Reference spec.md, plan.md, research.md already in context; review code changes via `git diff main`
   - Generate `summary.md` with mandatory sections:
     - **Overview**: What was built, mental model, prerequisites (NO code)
     - **Architecture Walkthrough**: Numbered data-flow steps with code snippets and **Why this matters** callouts
     - **Code Deep-Dives**: Min 3 subsections, each with 10-30 line snippet, **Line-by-line** annotations, **What you'd miss skimming** callout
     - **Design Decisions**: Numbered **Chose/Over** format with code comparison when applicable
     - **Edge Cases & Gotchas**: Actual code with non-obvious explanations (omit if none)
   - 60-70% of doc MUST be annotated code snippets; fenced blocks with language tags; narrative walkthrough, not bullet lists; engineer-to-engineer voice

10. **Commit**: `git add -A` then `feat(<branch>): implement <feature summary>`

11. Suggest next steps: "Run `/spec.review` or `/spec.conclude`."

**Teardown**: Run `bash .claude/specify/scripts/bash/teardown-phase.sh --command "spec.implement" --json` to signal command completion.
