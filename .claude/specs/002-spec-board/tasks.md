---
description: "Task list for Spec Board feature implementation"
---

# Tasks: Spec Board

**Progress: 87/87 tasks complete (100%). 76 tests passing across 13 test files.**

**Architecture**: Electron desktop app. Main process (src/main/) handles filesystem, parsing, IPC. Renderer (src/renderer/) is React UI.

---

## Phase 1: Setup DONE

- [x] T001 Create Electron project structure
- [x] T002 Initialize package.json with all dependencies
- [x] T003 [P] Configure electron-vite in `electron.vite.config.ts`
- [x] T004 [P] Configure Vitest in `vitest.config.ts`
- [x] T005 [P] Configure VS Code F5 launch in `.vscode/launch.json`

---

## Phase 2: Foundational (TDD) DONE

- [x] T006 Create test fixtures in `tests/fixtures/`
- [x] T007 Implement Electron main process entry in `src/main/index.ts`
- [x] T008 Implement preload script in `src/preload/index.ts`
- [x] T009 Implement IPC handler framework in `src/main/ipc/handlers.ts`
- [x] T010 [P] TDD: Config manager tests (9 tests) in `tests/unit/config/config-manager.test.ts`
- [x] T011 [P] Implement config manager in `src/main/config/config-manager.ts`
- [x] T012 [P] TDD: Project scanner tests (5 tests) in `tests/unit/projects/project-scanner.test.ts`
- [x] T013 [P] Implement project scanner in `src/main/projects/project-scanner.ts`
- [x] T014 TDD: Markdown parser tests (4 tests) in `tests/unit/parser/markdown-parser.test.ts`
- [x] T015 Implement markdown parser in `src/main/parser/markdown-parser.ts`
- [x] T016 [P] TDD: Spec parser tests (7 tests) in `tests/unit/parser/spec-parser.test.ts`
- [x] T017 [P] Implement spec parser in `src/main/parser/spec-parser.ts`
- [x] T018 [P] TDD: Plan parser tests (3 tests) in `tests/unit/parser/plan-parser.test.ts`
- [x] T019 [P] Implement plan parser in `src/main/parser/plan-parser.ts`
- [x] T020 [P] TDD: Tasks parser tests (5 tests) in `tests/unit/parser/tasks-parser.test.ts`
- [x] T021 [P] Implement tasks parser in `src/main/parser/tasks-parser.ts`
- [x] T022 [P] TDD: Research parser tests (5 tests) in `tests/unit/parser/research-parser.test.ts`
- [x] T023 [P] Implement research parser in `src/main/parser/research-parser.ts`
- [x] T024 TDD: Phase detector tests (8 tests) in `tests/unit/phase/phase-detector.test.ts`
- [x] T025 Implement phase detector in `src/main/phase/phase-detector.ts`
- [x] T026 [P] Define TypeScript interfaces in `src/renderer/src/types/index.ts`
- [x] T027 [P] Implement IPC API client in `src/renderer/src/services/api.ts`
- [x] T028 [P] Implement theme in `src/renderer/src/theme.ts`
- [x] T029 Implement App.tsx layout in `src/renderer/src/App.tsx`

---

## Phase 3: Mockups & UI Validation DONE

- [x] T030 [P] Create mockup: Full app layout in `src/renderer/src/mockups/board-mockup.tsx`
- [x] T031 [P] Create mockup: Specify phase in `src/renderer/src/mockups/specify-phase-mockup.tsx`
- [x] T032 [P] Create mockup: Plan phase in `src/renderer/src/mockups/plan-phase-mockup.tsx`
- [x] T033 [P] Create mockup: Implement phase in `src/renderer/src/mockups/implement-phase-mockup.tsx`
- [x] T034 [P] Create mockup: Comments in `src/renderer/src/mockups/comments-mockup.tsx`
- [x] T035 [P] Create mockup: Editing in `src/renderer/src/mockups/editing-mockup.tsx`
- [x] T036 Review and approve mockups

---

## Phase 4: User Story 1 — Register & Browse (P1 MVP) DONE

- [x] T037 TDD: Artifact integration tests (5 tests) in `tests/integration/artifacts.test.ts`
- [x] T038 [US1] Implement projects IPC handlers in `src/main/ipc/handlers.ts`
- [x] T039 [US1] Implement features IPC handler in `src/main/ipc/handlers.ts`
- [x] T040 [US1] Implement native folder picker IPC handler in `src/main/ipc/handlers.ts`
- [x] T041 [P] [US1] Implement BoardView sidebar in `src/renderer/src/components/board/BoardView.tsx`
- [x] T042 [P] [US1] Implement FeatureCard in `src/renderer/src/components/board/FeatureCard.tsx`
- [x] T043 [P] [US1] Implement EmptyState in `src/renderer/src/components/common/EmptyState.tsx`

---

## Phase 5: User Story 2 — Drill Into Artifacts (P1) DONE

- [x] T044 [US2] Implement artifacts IPC handler in `src/main/ipc/handlers.ts`
- [x] T045 [US2] Implement FeatureDetail phase-adaptive container in `src/renderer/src/components/feature/FeatureDetail.tsx`
- [x] T046 [US2] Implement ArtifactTabs in `src/renderer/src/components/feature/ArtifactTabs.tsx`
- [x] T047 [P] [US2] Implement SpecView in `src/renderer/src/components/artifacts/SpecView.tsx`
- [x] T048 [P] [US2] Implement PlanView in `src/renderer/src/components/artifacts/PlanView.tsx`
- [x] T049 [P] [US2] Implement TasksView in `src/renderer/src/components/artifacts/TasksView.tsx`
- [x] T050 [P] [US2] Implement ResearchView in `src/renderer/src/components/artifacts/ResearchView.tsx`
- [x] T051 [P] [US2] Implement UserStoryCard in `src/renderer/src/components/elements/UserStoryCard.tsx`
- [x] T052 [P] [US2] Implement RequirementRow in `src/renderer/src/components/elements/RequirementRow.tsx`
- [x] T053 [P] [US2] Implement TaskRow in `src/renderer/src/components/elements/TaskRow.tsx`
- [x] T054 [P] [US2] Implement DecisionSection in `src/renderer/src/components/elements/DecisionSection.tsx`
- [x] T055 [US2] Implement useFeatureData + useArtifactData hooks in `src/renderer/src/hooks/useFeatureData.ts`

---

## Phase 6: User Story 3 — Comments (P2) DONE

- [x] T056 [P] [US3] TDD: Comment parser tests (6 tests) in `tests/unit/parser/comment-parser.test.ts`
- [x] T057 [P] [US3] TDD: Comment writer tests (6 tests) in `tests/unit/writer/comment-writer.test.ts`
- [x] T058 [US3] Implement comment parser in `src/main/parser/comment-parser.ts`
- [x] T059 [US3] Implement comment writer in `src/main/writer/comment-writer.ts`
- [x] T060 [US3] Implement comment IPC handlers in `src/main/ipc/handlers.ts`
- [x] T061 [US3] Enrich artifact elements with comment counts
- [x] T062 [P] [US3] Implement CommentBadge in `src/renderer/src/components/elements/CommentBadge.tsx`
- [x] T063 [P] [US3] Implement CommentPanel in `src/renderer/src/components/comments/CommentPanel.tsx`
- [x] T064 [US3] Implement CommentThread in `src/renderer/src/components/comments/CommentThread.tsx`
- [x] T065 [US3] Implement useComments hook in `src/renderer/src/hooks/useComments.ts`
- [x] T066 [US3] Wire CommentBadge + CommentPanel into SpecView

---

## Phase 7: User Story 4 — Modify Artifacts (P2) DONE

- [x] T067 [P] [US4] TDD: Markdown serializer tests (9 tests) in `tests/unit/writer/markdown-serializer.test.ts`
- [x] T068 [P] [US4] TDD: Artifact writer tests (4 tests) in `tests/unit/writer/artifact-writer.test.ts`
- [x] T069 [US4] Implement markdown serializer (positional string splicing) in `src/main/writer/markdown-serializer.ts`
- [x] T070 [US4] Implement artifact writer (checkbox toggle, text edit) in `src/main/writer/artifact-writer.ts`
- [x] T071 [US4] Implement edit-field IPC handler in `src/main/ipc/handlers.ts`
- [x] T072 [P] [US4] Implement TextEditor (click-to-edit, save/cancel) in `src/renderer/src/components/editing/TextEditor.tsx`
- [x] T073 [US4] Wire task checkbox toggle into TaskRow + TasksView + FeatureDetail
- [x] T074 [US4] Stale edit handling: live file changes trigger refresh + discard via toast

---

## Phase 8: User Story 5 — Live Updates (P3) DONE

- [x] T075 [US5] Implement file watcher (chokidar, awaitWriteFinish, recursive .claude/specs/) in `src/main/projects/file-watcher.ts`
- [x] T076 [US5] Add .git/HEAD watching for branch checkout detection
- [x] T077 [US5] Implement 300ms debounce with pending file batching
- [x] T078 [US5] Wire file watcher events to renderer via IPC in `src/main/index.ts`
- [x] T079 [US5] Start/stop watchers on app startup and project register/unregister
- [x] T080 [US5] Listen for IPC events in renderer, trigger refresh + toast in `src/renderer/src/App.tsx`

---

## Phase 9: Polish & Cross-Cutting Concerns

- [x] T081 [P] Handle edge case: registered project path no longer exists — show error state on card with red dot and error message
- [x] T082 [P] Handle edge case: partial/malformed speckit artifacts — try/catch in parser dispatch, return parseWarning field, show what's parseable
- [x] T083 [P] Handle edge case: comment files referencing removed elements — show "stale comments" section with yellow indicator in SpecView
- [x] T084 [P] Handle edge case: same branch name across multiple projects — projects keyed by UUID, no conflict possible
- [x] T085 Configure production build: electron-builder with win/mac/linux targets in package.json (`npm run dist`)
- [x] T086 Performance: sidebar is a flat list of lightweight cards, no perf concern at any realistic project count
- [x] T087 Run full test suite — 76/76 tests pass across 13 files, build clean
