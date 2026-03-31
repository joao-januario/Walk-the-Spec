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

1. **Load context**: Read plan.md, spec.md, and all available design artifacts (research.md, data-model.md, contracts/, quickstart.md) — always load these if they exist. Plan.md contains the file paths you will create or modify — use those paths directly.

   **NAVIGATION RULES — MANDATORY, NO EXCEPTIONS:**
   - You already have file paths from plan.md. Go directly to those files. That is your codebase context.
   - If you need to understand an existing file, Read it by its exact path. You do not need to "discover" anything.
   - If you need to find where a function is called, Grep for its name. One search. Read the matches. Done.
   - **NEVER** spawn Explore agents. **NEVER** run Glob with broad patterns like `**/*.ts`. **NEVER** read directories to "get oriented." **NEVER** read files not mentioned in plan.md unless a specific Grep result points you there.
   - When spawning sub-agents: embed the exact file paths, the plan step, and any code snippets they need inline in the prompt. Sub-agents are **FORBIDDEN** from running Glob, broad Grep, or reading files outside their assignment. If they need context you didn't provide, that is YOUR failure to brief them — fix the prompt, don't let them explore.

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

9. **Generate implementation summary** — MANDATORY BEFORE COMMIT, NO EXCEPTIONS:
   - Check whether `summary.md` exists in FEATURE_DIR
   - If it already exists and is complete (has all required sections): proceed
   - If it does not exist or is incomplete: **generate it now** — this step is not optional, cannot be deferred, and cannot be skipped regardless of time, complexity, or any other reason
   - Read template from `.claude/specify/templates/summary-template.md` and follow its structure EXACTLY
   - Review code changes via `git diff main`; reference spec.md, plan.md, research.md already in context
   - Required sections (all mandatory):
     - **Overview**: What was built, mental model, prerequisites (NO code)
     - **Architecture Walkthrough**: Numbered data-flow steps with code snippets and **Why this matters** callouts
     - **Code Deep-Dives**: Min 3 subsections, each with 10-30 line snippet, **Line-by-line** annotations, **What you'd miss skimming** callout
     - **Design Decisions**: Numbered **Chose/Over** format with code comparison when applicable
     - **Edge Cases & Gotchas**: Actual code with non-obvious explanations (omit if none genuinely exist)
   - 60-70% of doc MUST be annotated code snippets; fenced blocks with language tags; narrative walkthrough, not bullet lists; engineer-to-engineer voice
   - **GATE**: Do not proceed to step 10 until `summary.md` exists in FEATURE_DIR with all required sections present

10. **Commit**: `git add -A` then `feat(<branch>): implement <feature summary>`

11. Suggest next steps: "Run `/spec.review` or `/spec.conclude`."

**Teardown**: Run `bash .claude/specify/scripts/bash/teardown-phase.sh --command "spec.implement" --json` to signal command completion.
