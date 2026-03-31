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

5. **Execute implementation** following the plan — in three sub-phases per user story:

   **Sub-phase A — Implement with embedded logging**
   - Implement the feature
   - Embed structured logging throughout as you write — not as an afterthought:
     - Function entry/exit: log parameters and return values for non-trivial functions
     - Branch decisions: log the condition and which path was taken (e.g. `[FEATURE] cache hit: false, fetching from disk`)
     - External calls: log every IPC call, file I/O, network request with request + response summary
     - State changes: log before/after for any meaningful state mutation
   - Use a consistent prefix per feature (e.g. `[PARSER]`, `[WATCHER]`) for easy log filtering
   - Use the project's existing log mechanism (console.log, electron-log, structured logger — match what's already in the codebase)
   - File-based coordination: same-file tasks run sequentially

   **Sub-phase B — Real-run verification loop** ← this is the correctness gate
   - Determine how to run the feature: check package.json scripts, look at how the project starts
   - Start the process (dev server, CLI, script — whatever exercises the code path)
   - Exercise the **exact user story path** from spec.md: trigger the feature as a real user would
   - Read and analyse the log output. Check:
     - Expected log entries appear with correct values
     - No unexpected errors or exceptions appear
     - Data flows through the expected path (visible in logs)
   - If anything is wrong: fix the code and re-run. Do not proceed until logs confirm correct behaviour
   - This loop is the correctness signal — tests cannot substitute for this step
   - Once logs confirm correct behaviour: remove any logs that are too verbose for production; keep meaningful ones

   **Sub-phase C — Test codification**
   - Now that you have observed the feature working, write tests encoding that verified behaviour
   - You now know exactly what to mock (you saw the real calls in logs), what the inputs/outputs are (you saw real values), and which paths matter (you exercised them)
   - Tests written here should pass immediately — you are codifying what you know works, not discovering behaviour
   - If a test fails: it means your test assumption is wrong, not the implementation — fix the test to match observed reality, or investigate a genuine regression
   - **Test quality over coverage**: do NOT write tests to hit a coverage number. Write tests that would catch a real regression. Ask for each test: "if this breaks, does it mean something real is broken?" If not, don't write it.
   - Required: at least one test per happy path, one per meaningful failure state, one per non-obvious edge case surfaced during verification
   - Forbidden: tests that duplicate each other, tests that only assert the implementation structure (testing mocks calling mocks), tests added purely to inflate numbers
   - A feature shipped with 8 precise tests is better than one shipped with 40 tests that wouldn't catch the bugs you just fixed

6. **Execution order**: Setup → implement with logging → real-run until logs confirm correct → codify in tests → integration → polish/validation

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
