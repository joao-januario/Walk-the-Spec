# Research: Spec Board

**Branch**: `002-spec-board` | **Date**: 2026-03-24

## Decision 1: Markdown Parsing Strategy

**Decision**: Hybrid approach — unified/remark for reading, positional string splicing for writing.

**Rationale**: Speckit artifacts have complex, hierarchical markdown structures (nested headings, bold IDs like FR-001/SC-001/T001, GWT scenarios, checkboxes, YAML frontmatter). remark-parse produces a typed mdast AST with position data on every node, making structured extraction straightforward. For the write path, remark-stringify normalizes formatting (changes whitespace, emphasis markers, list indentation), which would break speckit file formatting. Instead, use position offsets from the AST to do surgical string splicing on the original source — only the targeted edit changes, everything else is preserved byte-for-byte.

**Alternatives considered**:
- **marked with custom tokenizer**: No write path at all. Would require building a markdown serializer from scratch. Token model is less suitable for structured extraction than mdast.
- **Pure regex parsing**: Good for formatting preservation but cannot handle heading hierarchy/section scoping (knowing FR-001 belongs under "Functional Requirements" under "Requirements"). Fragile for multi-line content. Accumulates maintenance burden. Still used as a complement to remark for extracting inline patterns (IDs, statuses) from text nodes.

**Dependencies**:
- `unified` — processor core
- `remark-parse` — markdown to mdast
- `remark-gfm` — checkboxes, tables
- `remark-frontmatter` — YAML frontmatter (tasks.md)
- `unist-util-visit` — tree traversal
- `remark-stringify` — only for generating new files (comment files), not round-trip editing

## Decision 2: File Watching

**Decision**: Chokidar v5 with application-level debounce.

**Rationale**: Zero native dependencies (pure JS) ensures cross-platform reliability on Windows, macOS, and Linux without C++ compilation or prebuild resolution. Supports direct file watching (needed for `.git/HEAD` branch detection). `awaitWriteFinish` option handles Claude writing multiple files in rapid succession. 110M+ weekly npm downloads, used by Vite, webpack, Angular CLI. Scale (20 directories with small spec subtrees) is trivially within comfort zone.

**Alternatives considered**:
- **@parcel/watcher**: Excellent performance via C++ coalescing, used by VSCode. However: native addon adds installation friction (prebuild failures are a recurring issue), cannot watch individual files (only directories — problematic for `.git/HEAD`), and throttle timing is hardcoded at 500ms in C++.
- **Native fs.watch**: Inconsistent cross-platform behavior (filename not always provided on Linux, duplicate events, recursive watching bugs in Node 20/21). Would require reimplementing everything chokidar already does.

**Architecture**:
- One chokidar watcher per project watching `<projectDir>/.claude/specs/` with `awaitWriteFinish` enabled
- Separate watch on each `<projectDir>/.git/HEAD` for branch change detection
- 200-500ms application-level debounce before batching and pushing via WebSocket

## Decision 3: Frontend Framework

**Decision**: React 19 with Vite.

**Rationale**: React is the most widely used frontend framework with the largest ecosystem of UI components. The phase-adaptive views, structured artifact rendering, and inline editing all benefit from React's component composition model. Vite provides fast HMR during development. For a local dev tool, the slightly larger bundle size vs alternatives is irrelevant.

**Alternatives considered**:
- **Svelte/SvelteKit**: Lighter bundle, less boilerplate. However, smaller component ecosystem for complex UI patterns (expandable sections, inline editing, drag handles). Less familiar to most developers.
- **Vue**: Solid alternative but no strong advantage over React for this use case.
- **Vanilla JS / Web Components**: Too much manual work for the UI complexity required (phase-adaptive views, form controls, comment threads).

## Decision 4: Backend Framework

**Decision**: Express with ws for WebSocket.

**Rationale**: Express is the most mature Node.js HTTP framework. The API surface is simple (project CRUD, artifact reads, comment writes, edit writes). No need for a more opinionated framework. `ws` is the standard WebSocket library — lightweight, well-maintained, and integrates easily with Express's HTTP server.

**Alternatives considered**:
- **Fastify**: Better performance characteristics, but the performance difference is negligible for a single-user local tool with <100 req/s.
- **Socket.IO**: Adds unnecessary abstraction (rooms, namespaces, automatic reconnection protocol). Plain WebSocket with JSON messages is sufficient for push notifications.

## Decision 5: Comment File Format

**Decision**: Markdown files with speckit-compatible structure, one per artifact.

**Rationale**: Comments stored as `comments/spec-comments.md`, `comments/plan-comments.md`, `comments/tasks-comments.md` in the feature's speckit directory. Each comment is a section with the target element reference (using existing IDs/headings) and the comment content. Markdown format means Claude can read them naturally, and speckit skills can parse them with the same remark-based parser.

**Format**:
```markdown
# Comments: spec.md

## FR-001
- [2026-03-24] This requirement seems too broad. Consider splitting into registration and validation.

## User Story 2 - Drill Into Feature Artifacts
- [2026-03-24] The acceptance scenario for Plan phase needs more detail on what "primary content" means.
- [2026-03-24] Should design decisions show linked requirements?
```

**Alternatives considered**:
- **JSON files**: Machine-readable but not human-readable. Claude would need to parse JSON rather than reading natural markdown.
- **YAML files**: Better than JSON for readability but still less natural than markdown for Claude.
- **Inline markers in artifact files**: Would modify the artifacts themselves, creating noise and potential parsing issues.

## Decision 6: Testing Strategy

**Decision**: Vitest for unit and integration tests. No E2E framework.

**Rationale**: Vitest is the natural choice for a Vite-based project — same config, same transform pipeline, fast execution. For a local single-user dev tool, the test focus should be on parser correctness (unit tests for each artifact type) and the write-back path (integration tests verifying markdown is preserved). E2E testing is not needed for v1.

**Test priority**:
1. Parser unit tests — each artifact type parsed correctly
2. Writer integration tests — edits and comments produce valid markdown
3. Phase detection tests — correct phase inferred from artifact presence
