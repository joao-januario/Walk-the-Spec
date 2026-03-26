---
description: Execute the implementation plan by deriving tasks from plan.md artifacts and implementing them in priority order.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Pre-Execution Checks

**Bootstrap**: Run `.claude/specify/scripts/powershell/bootstrap-phase.ps1 -Command "spec.implement" -Phase implement -Json` from repo root and parse JSON for FEATURE_DIR, AVAILABLE_DOCS, HAS_EXTENSIONS. All paths must be absolute. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

## Outline

1. **Load context**: Read plan.md, spec.md, and all available context files (research.md, data-model.md, contracts/, quickstart.md) in parallel.

2. **Check checklists status** (if FEATURE_DIR/checklists/ exists):
   - Scan all checklist files in the checklists/ directory
   - For each checklist, count:
     - Total items: All lines matching `- [ ]` or `- [X]` or `- [x]`
     - Completed items: Lines matching `- [X]` or `- [x]`
     - Incomplete items: Lines matching `- [ ]`
   - Create a status table:

     ```text
     | Checklist | Total | Completed | Incomplete | Status |
     |-----------|-------|-----------|------------|--------|
     | ux.md     | 12    | 12        | 0          | ✓ PASS |
     | test.md   | 8     | 5         | 3          | ✗ FAIL |
     | security.md | 6   | 6         | 0          | ✓ PASS |
     ```

   - Calculate overall status:
     - **PASS**: All checklists have 0 incomplete items
     - **FAIL**: One or more checklists have incomplete items

   - **If any checklist is incomplete**:
     - Display the table with incomplete item counts
     - **STOP** and ask: "Some checklists are incomplete. Do you want to proceed with implementation anyway? (yes/no)"
     - Wait for user response before continuing
     - If user says "no" or "wait" or "stop", halt execution
     - If user says "yes" or "proceed" or "continue", proceed to step 3

   - **If all checklists are complete**:
     - Display the table showing all checklists passed
     - Automatically proceed to step 3

3. **Generate execution plan**: Generate an internal execution plan from plan.md artifacts. Derive task ordering from the plan's file structure and the spec's user story priorities. Execute: infrastructure/setup first, then foundational components, then user stories in priority order, then polish.

4. **Project Setup Verification**:
   - **REQUIRED**: Create/verify ignore files based on actual project setup:

   **Detection & Creation Logic**:
   - Check if the following command succeeds to determine if the repository is a git repo (create/verify .gitignore if so):

     ```sh
     git rev-parse --git-dir 2>/dev/null
     ```

   - Check if Dockerfile* exists or Docker in plan.md → create/verify .dockerignore
   - Check if .eslintrc* exists → create/verify .eslintignore
   - Check if eslint.config.* exists → ensure the config's `ignores` entries cover required patterns
   - Check if .prettierrc* exists → create/verify .prettierignore
   - Check if .npmrc or package.json exists → create/verify .npmignore (if publishing)
   - Check if terraform files (*.tf) exist → create/verify .terraformignore
   - Check if .helmignore needed (helm charts present) → create/verify .helmignore

   **If ignore file already exists**: Verify it contains essential patterns, append missing critical patterns only
   **If ignore file missing**: Create with full pattern set for detected technology

   **Common Patterns by Technology** (from plan.md tech stack):
   - **Node.js/JavaScript/TypeScript**: `node_modules/`, `dist/`, `build/`, `*.log`, `.env*`
   - **Python**: `__pycache__/`, `*.pyc`, `.venv/`, `venv/`, `dist/`, `*.egg-info/`
   - **Java**: `target/`, `*.class`, `*.jar`, `.gradle/`, `build/`
   - **C#/.NET**: `bin/`, `obj/`, `*.user`, `*.suo`, `packages/`
   - **Go**: `*.exe`, `*.test`, `vendor/`, `*.out`
   - **Ruby**: `.bundle/`, `log/`, `tmp/`, `*.gem`, `vendor/bundle/`
   - **PHP**: `vendor/`, `*.log`, `*.cache`, `*.env`
   - **Rust**: `target/`, `debug/`, `release/`, `*.rs.bk`, `*.rlib`, `*.prof*`, `.idea/`, `*.log`, `.env*`
   - **Kotlin**: `build/`, `out/`, `.gradle/`, `.idea/`, `*.class`, `*.jar`, `*.iml`, `*.log`, `.env*`
   - **C++**: `build/`, `bin/`, `obj/`, `out/`, `*.o`, `*.so`, `*.a`, `*.exe`, `*.dll`, `.idea/`, `*.log`, `.env*`
   - **C**: `build/`, `bin/`, `obj/`, `out/`, `*.o`, `*.a`, `*.so`, `*.exe`, `*.dll`, `autom4te.cache/`, `config.status`, `config.log`, `.idea/`, `*.log`, `.env*`
   - **Swift**: `.build/`, `DerivedData/`, `*.swiftpm/`, `Packages/`
   - **R**: `.Rproj.user/`, `.Rhistory`, `.RData`, `.Ruserdata`, `*.Rproj`, `packrat/`, `renv/`
   - **Universal**: `.DS_Store`, `Thumbs.db`, `*.tmp`, `*.swp`, `.vscode/`, `.idea/`

   **Tool-Specific Patterns**:
   - **Docker**: `node_modules/`, `.git/`, `Dockerfile*`, `.dockerignore`, `*.log*`, `.env*`, `coverage/`
   - **ESLint**: `node_modules/`, `dist/`, `build/`, `coverage/`, `*.min.js`
   - **Prettier**: `node_modules/`, `dist/`, `build/`, `coverage/`, `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`
   - **Terraform**: `.terraform/`, `*.tfstate*`, `*.tfvars`, `.terraform.lock.hcl`
   - **Kubernetes/k8s**: `*.secret.yaml`, `secrets/`, `.kube/`, `kubeconfig*`, `*.key`, `*.crt`

5. Execute implementation following the execution plan:
   - **Phase-by-phase execution**: Complete each phase before moving to the next
   - **Follow TDD approach**: Execute test tasks before their corresponding implementation tasks
   - **File-based coordination**: Tasks affecting the same files must run sequentially
   - **Validation checkpoints**: Verify each phase completion before proceeding

6. Implementation execution rules:
   - **Setup first**: Initialize project structure, dependencies, configuration
   - **Tests before code**: If you need to write tests for contracts, entities, and integration scenarios
   - **Core development**: Implement models, services, CLI commands, endpoints
   - **Integration work**: Database connections, middleware, logging, external services
   - **Polish and validation**: Unit tests, performance optimization, documentation

7. Progress tracking and error handling:
   - Report progress after each completed phase
   - Halt execution if a critical task fails
   - Provide clear error messages with context for debugging
   - Suggest next steps if implementation cannot proceed

8. Completion validation:
   - Verify all required tasks are completed
   - Check that implemented features match the original specification
   - Validate that tests pass and coverage meets requirements
   - Confirm the implementation follows the technical plan
   - Report final status with summary of completed work

9. **Generate implementation summary** (if not already present):
   - Check if `summary.md` exists in FEATURE_DIR
   - **If it already exists**: Log "Summary already exists — skipping generation" and proceed to step 10
   - **If it does not exist**:
     1. Read the summary template from `.claude/specify/templates/summary-template.md` — follow its structure EXACTLY
     2. Reference the spec.md, plan.md, and research.md content already loaded at the start of this phase. Only re-read if context has been truncated.
     3. Review all code changes made during this implementation (use `git diff main` or the implementation file paths)
     4. Use the source code from your implementation work (already in context) for code snippets. Only read files if context has been truncated.
     5. Generate `summary.md` in FEATURE_DIR following the template's mandatory section structure:
        - **Overview**: What was built, mental model, prerequisites (NO code)
        - **Architecture Walkthrough**: Numbered steps following the data flow, with actual code snippets at each step and **Why this matters** callouts
        - **Code Deep-Dives**: Minimum 3 subsections, each with a real 10-30 line code snippet, **Line-by-line** annotations, and **What you'd miss skimming** callout
        - **Design Decisions**: Numbered, each with **Chose/Over** format, with code comparison when applicable
        - **Edge Cases & Gotchas**: Show the actual code and explain why it's non-obvious (omit section if none)
     6. CRITICAL formatting rules:
        - 60-70% of the document MUST be annotated code snippets from the actual implementation
        - Every code snippet MUST use fenced blocks with language tags
        - Every code snippet MUST be preceded by context and followed by line-by-line explanations
        - Never list files as bullet points — walk through code as a narrative
        - Never restate task descriptions or spec requirements — those exist in other tabs
        - Write as an engineer explaining to another engineer during code review
     7. Write the generated content to `FEATURE_DIR/summary.md`

10. **Commit implementation work**:
    - Stage all changed files (`git add -A`)
    - Commit with message: `feat(<branch>): implement <feature summary>`
    - This ensures `/spec.review` can diff the branch against main

11. Suggest next steps: "Run `/spec.review` or `/spec.conclude`."

**Teardown**: Run `.claude/specify/scripts/powershell/teardown-phase.ps1 -Command "spec.implement" -Json` to signal command completion.
