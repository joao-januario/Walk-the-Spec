# Feature Specification: Spec Board

**Feature Branch**: `002-spec-board`
**Created**: 2026-03-24
**Status**: Draft
**Input**: User description: "Spec-board: a lightweight web dashboard that visualizes speckit artifacts for the currently checked-out branch across registered projects. Provides structured phase-adaptive views of specs, plans, tasks, and research with drill-down navigation, inline annotation via comment files, and structured field editing with changes written back to speckit files."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Register a Project and Browse Features (Priority: P1)

A developer registers one or more local project paths in Spec Board. For each registered project, Spec Board reads the currently checked-out branch and its speckit artifacts directly from the filesystem. Each project appears as a feature card showing its branch name, current phase, and artifact summary. The developer can scan the board to get an at-a-glance view of what they're actively working on across all their projects.

**Why this priority**: This is the foundational interaction. Without project registration and branch discovery, no other functionality is possible. It delivers immediate value by giving developers visibility into all speckit work happening across branches.

**Independent Test**: Can be fully tested by registering a project path and verifying that branches with `.claude/specs/` content appear as feature cards on the board.

**Acceptance Scenarios**:

1. **Given** a developer has multiple local projects, **When** they register each project path in Spec Board, **Then** each project with speckit content on its checked-out branch appears as a feature card on the board.
2. **Given** a registered project, **When** the developer switches branches (checkout) to one with speckit artifacts and refreshes or re-navigates to the board, **Then** the feature card reflects the new branch's content. (Automatic update without refresh is delivered by User Story 5.)
3. **Given** a registered project whose checked-out branch has no speckit content, **When** the developer views the board, **Then** the project is shown in a minimal/empty state indicating no active feature.
4. **Given** multiple projects are registered, **When** the developer views the board, **Then** features from all registered projects are visible and distinguishable by project.

---

### User Story 2 - Drill Into Feature Artifacts (Priority: P1)

A developer clicks on a feature card and sees a phase-adaptive detail view that foregrounds the most relevant content for the feature's current phase. During Specify, user stories and requirements are the hero content with edit/comment affordances. During Plan, design decisions and architecture take prominence. During Implement, task progress and status dominate the view. Secondary artifacts remain accessible but are visually deprioritized. The developer can drill deeper into any element to see full details, acceptance criteria, dependencies, and linked items.

**Why this priority**: Phase-adaptive viewing is the core value proposition. Showing the right information at the right time based on where the feature is in its lifecycle is what makes Spec Board useful as a working tool, not just a file browser. This is co-equal with P1 because registration without meaningful drill-down delivers minimal value.

**Independent Test**: Can be fully tested by navigating to features at different phases and verifying the hero content changes appropriately — user stories prominent during Specify, tasks prominent during Implement.

**Acceptance Scenarios**:

1. **Given** a feature in the Specify phase, **When** the developer opens it, **Then** user stories and requirements are the primary content, with edit and comment controls readily accessible.
2. **Given** a feature in the Plan phase, **When** the developer opens it, **Then** design decisions and architecture sections are the primary content.
3. **Given** a feature in the Implement phase, **When** the developer opens it, **Then** task progress, status, and dependencies are the primary content with progress indicators.
4. **Given** any feature phase, **When** the developer wants to see non-primary artifacts, **Then** they can navigate to them via secondary tabs or sections without leaving the feature view.
5. **Given** a feature with a plan artifact, **When** the developer drills into a design decision, **Then** they see rationale, alternatives, and related elements as expandable sections.

---

### User Story 3 - Annotate and Comment on Elements (Priority: P2)

A developer reviewing a feature's artifacts adds inline comments to specific elements - a question on a user story's acceptance criteria, a concern about a task's dependency, or a suggestion on a design decision. Comments are written as files directly into the feature's speckit directory so that Claude can discover and act on them during its normal workflow. Comments are visually distinct from the artifact content in the dashboard.

**Why this priority**: Annotation turns Spec Board from a passive viewer into an active review tool. By writing comment files directly into the speckit directory, the feedback loop is native to the file-based workflow that Claude already uses. The core viewing experience must work first.

**Independent Test**: Can be fully tested by navigating to any artifact element, adding a comment, and verifying a corresponding file is created in the feature's speckit directory with correct element references.

**Acceptance Scenarios**:

1. **Given** any rendered artifact element (user story, task, decision, section), **When** the developer clicks to annotate, **Then** an inline comment input appears attached to that element.
2. **Given** a developer submits a comment on a spec element, **When** the comment is saved, **Then** the per-artifact comment file (e.g., `.claude/specs/<branch>/comments/spec-comments.md`) is created or updated with the comment and a reference to the target element, in a speckit-compatible format.
3. **Given** comment files exist in the speckit directory, **When** the developer views the feature in Spec Board, **Then** comments are rendered inline next to their referenced elements.
4. **Given** a developer wants to modify feedback, **When** they edit or delete a comment in Spec Board, **Then** the corresponding comment file is updated or removed from the speckit directory.

---

### User Story 4 - Modify Artifacts Through the Dashboard (Priority: P2)

A developer uses Spec Board to edit specific structured fields within speckit artifacts — updating a task's status, changing a priority, or refining a requirement's text — through form controls rather than raw markdown editing. Spec Board handles the markdown serialization and writes changes back to the speckit files, where Claude can read them during its next interaction.

**Why this priority**: Structured editing completes the read-write cycle, making Spec Board a true collaboration surface rather than just a viewer. Form-based editing avoids the complexity and risk of raw markdown editing while covering the most common modification needs. Depends on the structured views being in place first.

**Independent Test**: Can be fully tested by changing a task's status or a requirement's text through form controls and verifying the corresponding speckit file is updated on disk with correct markdown.

**Acceptance Scenarios**:

1. **Given** a rendered artifact element with editable fields (status, priority, text), **When** the developer clicks to edit, **Then** appropriate form controls appear for that field type (dropdown for status, text input for descriptions, etc.).
2. **Given** a developer makes a field edit and saves, **When** the save completes, **Then** the corresponding speckit file on disk reflects the change with valid markdown formatting preserved.
3. **Given** a developer edits a task's status via dropdown, **When** the change is saved, **Then** the tasks.md file is updated with the new status while preserving the rest of the file structure.
4. **Given** a speckit file is modified externally while the developer has an edit in progress, **When** the change is detected, **Then** the view reloads with the new content, the in-progress edit is discarded, and a notification informs the developer that the file was updated externally.

---

### User Story 5 - Live Updates from File Changes (Priority: P3)

While a developer has Spec Board open, another process (Claude CLI, a teammate, or the developer themselves) modifies speckit artifacts or creates/deletes branches. Spec Board detects these changes and updates the UI in real time without requiring a page refresh. The developer always sees the current state of all tracked features.

**Why this priority**: Live updates improve the experience but are not essential for the core use case. Developers can manually refresh to see changes. This is an enhancement that makes Spec Board feel responsive during active development sessions.

**Independent Test**: Can be fully tested by opening Spec Board, modifying a speckit file externally, and verifying the UI updates within a few seconds without manual refresh.

**Acceptance Scenarios**:

1. **Given** Spec Board is open and displaying a feature, **When** a speckit file is modified on disk, **Then** the affected artifact view updates within 5 seconds.
2. **Given** Spec Board is open, **When** the developer checks out a different branch in a registered project, **Then** the feature card updates to reflect the new branch's speckit content.
3. **Given** Spec Board is open, **When** the checked-out branch has no speckit content, **Then** the project card shows an empty/inactive state.
4. **Given** multiple changes happen in rapid succession, **When** Spec Board processes the updates, **Then** it batches them to avoid UI flickering and maintains a consistent state.

---

### Edge Cases

- What happens when a registered project path no longer exists or becomes inaccessible?
- How does the system handle branches with partial or malformed speckit artifacts?
- What happens when a speckit file is being written to (mid-save) and the watcher triggers?
- How does the system behave when the same branch name exists across multiple registered projects?
- What happens when the developer adds a comment to an element that is subsequently removed from the artifact?
- How does the system handle very large speckit files or features with hundreds of tasks? → Resolved: render all parsed elements; use collapsible sections and lazy rendering for phases with 50+ tasks to maintain UI responsiveness.
- What happens when a file write from Spec Board conflicts with a concurrent external modification? → Resolved: reload and discard in-progress edit with notification.
- How does the system handle comment files that reference elements no longer present in the artifact?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to register one or more local project paths for monitoring, persisted in a config file in the user's home directory (e.g., `~/.spec-board/config.json`)
- **FR-002**: System MUST detect the currently checked-out branch for each registered project and read its speckit artifacts (`.claude/specs/` directory) directly from the filesystem
- **FR-003**: System MUST display each registered project's active feature (checked-out branch with speckit content) as a card on a board view, showing branch name, current speckit phase, and artifact summary
- **FR-004**: System MUST parse speckit markdown artifacts (spec.md, plan.md, tasks.md, research files) into structured data
- **FR-005**: System MUST render spec user stories as navigable cards with priority, acceptance criteria, and linked tasks
- **FR-006**: System MUST render tasks as grouped lists organized by phase, status, and dependencies
- **FR-007**: System MUST render design decisions and plan sections as expandable/collapsible sections
- **FR-008**: System MUST support drill-down navigation from board to feature to individual artifact elements
- **FR-008a**: System MUST render a phase-adaptive detail view that foregrounds the most relevant content for the feature's current phase (user stories during Specify, design decisions during Plan, task progress during Implement) while keeping secondary artifacts accessible
- **FR-008b**: System MUST infer the current phase from artifact presence and content: spec.md only = Specify, plan.md exists = Plan, tasks.md exists = Tasks, tasks with in-progress statuses = Implement
- **FR-009**: System MUST allow users to add inline comments/annotations to any rendered artifact element
- **FR-010**: System MUST write comments as one file per artifact into the feature's speckit directory (e.g., `.claude/specs/<branch>/comments/spec-comments.md`, `comments/tasks-comments.md`) using a speckit-compatible format that speckit skills can parse and act on
- **FR-011**: System MUST reference target elements in comment files using existing artifact IDs and headings (e.g., FR-001, SC-002, "User Story 1") so references are human-readable and unambiguous to both humans and speckit skills
- **FR-012**: System MUST support editing and deleting comments, updating or removing the corresponding files
- **FR-013**: System MUST support structured field editing (status, priority, text content) through form controls and write changes back to the corresponding speckit files on disk
- **FR-014**: System MUST preserve file structure and formatting when writing modifications back to speckit files
- **FR-015**: System MUST visually indicate which elements have comments attached
- **FR-016**: System MUST watch registered project directories for file changes and git branch state changes
- **FR-017**: System MUST push UI updates via real-time connection when underlying artifacts or branches change
- **FR-018**: System MUST update or clear feature cards when the checked-out branch changes or no longer has speckit content
- **FR-019**: System MUST handle branches with partial or malformed artifacts gracefully, displaying what can be parsed and indicating issues
- **FR-020**: System MUST detect external file modifications during an in-progress edit, reload the updated content, discard the in-progress edit, and notify the user

### Key Entities

- **Project**: A registered local project path. Has a name (derived from directory), path, and one active feature (the currently checked-out branch).
- **Feature**: Represents the currently checked-out branch's speckit artifacts for a project. Has a branch name, phase, and a collection of artifacts. Reflects whatever branch is checked out at the time.
- **Artifact**: A parsed speckit file (spec, plan, tasks, research). Has a type, parsed content, and raw source. Belongs to a Feature.
- **Element**: A discrete unit within an artifact (user story, task, decision, section). Can be annotated and edited. Has a type, content, and relationships to other elements.
- **Comment**: An annotation attached to a specific Element, stored within per-artifact comment files in the feature's speckit directory (e.g., `comments/spec-comments.md`). Has content, element reference, and creation time. Written in a speckit-compatible format so speckit skills can discover and process them.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can register a project and see all branches with speckit content on the board within 10 seconds of registration
- **SC-002**: Users can navigate from the board to any specific artifact element (e.g., a single task or user story) in 3 clicks or fewer
- **SC-003**: Structured artifact views render all parseable content from speckit files without data loss
- **SC-004**: Users can add a comment to any artifact element and verify the corresponding file appears in the speckit directory
- **SC-005**: Comment files written by Spec Board contain sufficient element references for Claude to locate the discussed content without ambiguity
- **SC-006**: Edits made through Spec Board are immediately reflected in the speckit files on disk and produce valid, parseable markdown
- **SC-007**: UI reflects file system changes (new branches, modified artifacts, deleted branches) within 5 seconds of the change occurring
- **SC-008**: The board remains responsive and usable with up to 20 registered projects, each showing its active feature
- **SC-009**: A user unfamiliar with Spec Board can register a project and navigate to a specific artifact element (e.g., a requirement or task) within 2 minutes without documentation or onboarding

## Clarifications

### Session 2026-03-24

- Q: How should Spec Board access artifacts from branches not currently checked out? → A: Only show the currently checked-out branch per project. Multiple features on the board come from multiple registered projects, not multiple branches within one project. No git plumbing or worktrees needed — direct filesystem reads/writes only.
- Q: How should comment files be organized? → A: One file per artifact (e.g., `comments/spec-comments.md`, `comments/tasks-comments.md`). Spec Board writes comments in a speckit-compatible format so that speckit skills can discover and act on them. Speckit skills must be updated to be comment-aware.
- Q: What level of artifact editing should v1 support? → A: Structured field editing only. Users edit specific fields (task status, priority, requirement text) through form controls. Spec Board handles markdown serialization. No raw markdown editor.
- Q: How should the board organize and display feature content? → A: Phase-adaptive views. The feature detail view foregrounds the most relevant content for the current phase. During Specify: user stories and requirements are hero content. During Plan: design decisions and architecture. During Tasks: task list and dependencies. During Implement: task progress and status. The phase determines the information hierarchy, not just a label. Mockups to be created during planning.
- Q: How should Spec Board determine a feature's current phase? → A: Infer from artifacts. Which files exist and their content determines the phase: spec.md only = Specify, plan.md exists = Plan, tasks.md exists = Tasks, tasks with in-progress statuses = Implement. Zero-config, naturally tracks the speckit workflow.
- Q: Where should registered project paths be persisted? → A: Config file in user home directory (e.g., `~/.spec-board/config.json`). Survives restarts, inspectable, doesn't depend on browser state.
- Q: How should comment files reference target elements? → A: Use existing IDs and headings from the artifacts (FR-001, SC-002, "User Story 1", section headings). Human-readable, no invented addressing scheme, leverages speckit's existing structure.
- Q: How should the system handle conflicts when a file is modified externally during an edit? → A: Reload and discard. If an external change is detected, force reload the content and discard the in-progress edit with a notification. Rationale: this only happens when the user is also prompting Claude, meaning they wanted the file updated.
- Q: Should tests be included? → A: Yes. TDD approach — unit tests written first for core backend modules (parsers, writers, phase detector, config manager, project scanner). Tests must fail before implementation. Stack: Vitest (unit + integration). No E2E framework needed.
- Q: Should mockups be created before implementation? → A: Yes. Static UI mockups must be created and validated before frontend component implementation to confirm visual direction for phase-adaptive views, board layout, comment panel, and editing controls.

## Assumptions

- Speckit artifacts follow the standard directory structure (`.claude/specs/<branch-name>/`) and file naming conventions (spec.md, plan.md, tasks.md)
- Git is installed and accessible on the system where Spec Board runs
- Projects are local to the machine running Spec Board (no remote repository browsing)
- Each project shows only the currently checked-out branch; no cross-branch scanning or historical tracking
- Comment files are organized as one file per artifact (e.g., `comments/spec-comments.md`) in a speckit-compatible format
- Speckit skills will be updated to discover and process comment files as part of their workflow (dependency on speckit skill changes)
- Spec Board runs as a native Electron desktop application, not a browser-based web app
- The system only needs to support a single user at a time (local development tool, not multi-tenant)
- Claude CLI will read comment files from the speckit directory as part of its normal artifact discovery
