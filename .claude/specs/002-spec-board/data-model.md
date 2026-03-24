# Data Model: Spec Board

**Branch**: `002-spec-board` | **Date**: 2026-03-24

## Entities

### Project

Represents a registered local project path.

| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Unique identifier, generated on registration |
| name | string | Display name, derived from directory basename |
| path | string | Absolute filesystem path to project root |
| currentBranch | string | Currently checked-out git branch name |
| hasSpeckitContent | boolean | Whether the checked-out branch has a `.claude/specs/` directory with artifacts |
| phase | Phase (enum) | Inferred phase of the active feature (if any) |

**Source**: `~/.spec-board/config.json` for registration, filesystem + git for runtime state.

**Validation rules**:
- `path` must be an existing directory
- `path` must contain a `.git/` directory (git repository)
- `name` is auto-derived but can be overridden by the user
- No two projects may have the same `path`

---

### Feature

Represents the currently checked-out branch's speckit artifacts for a project. Not persisted — derived at runtime from filesystem state.

| Field | Type | Description |
|-------|------|-------------|
| projectId | string | Reference to parent Project |
| branchName | string | Git branch name (e.g., `002-spec-board`) |
| phase | Phase (enum) | Inferred from artifact presence/content |
| specDir | string | Path to `.claude/specs/<branch>/` directory |
| artifacts | Artifact[] | Parsed artifacts found in specDir |
| summary | string | Brief description extracted from spec.md title or first heading |

**Lifecycle**: Exists only while the branch is checked out and has speckit content. Changes when the user checks out a different branch.

---

### Artifact

A parsed speckit file. Not persisted — derived from parsing files on disk.

| Field | Type | Description |
|-------|------|-------------|
| type | ArtifactType (enum) | spec, plan, tasks, research, data-model, checklist |
| filePath | string | Absolute path to the source markdown file |
| rawContent | string | Original file content (for write-back splicing) |
| elements | Element[] | Parsed structural elements |
| lastModified | Date | File modification timestamp |

**Validation rules**:
- `filePath` must exist and be readable
- `rawContent` must parse without fatal errors (partial parse results are acceptable per FR-019)

---

### Element

A discrete unit within an artifact. The atomic level at which comments and edits target.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Existing artifact ID (e.g., `FR-001`, `SC-002`, `T001`) or heading text (e.g., `User Story 1`) |
| type | ElementType (enum) | user-story, requirement, success-criterion, task, decision, section, edge-case |
| artifactType | ArtifactType | Which artifact this element belongs to |
| content | object | Type-specific structured data (see subtypes below) |
| position | Position | Start/end offsets in the source file (for write-back) |
| editableFields | EditableField[] | Which fields can be edited via form controls |
| commentCount | number | Number of comments targeting this element |

**Identity**: Elements are identified by their existing IDs (`FR-001`, `T001`, `SC-001`, `CHK001`) or by heading text for elements without IDs (user stories, sections, decisions).

---

### Element Subtypes (content shapes)

**UserStory**:
| Field | Type |
|-------|------|
| number | number |
| title | string |
| priority | string (P1, P2, P3...) |
| description | string |
| whyPriority | string |
| independentTest | string |
| acceptanceScenarios | GWTScenario[] |

**Requirement**:
| Field | Type |
|-------|------|
| id | string (FR-NNN) |
| text | string |
| needsClarification | boolean |
| clarificationNote | string (optional) |

**SuccessCriterion**:
| Field | Type |
|-------|------|
| id | string (SC-NNN) |
| text | string |

**Task**:
| Field | Type |
|-------|------|
| id | string (TNNN) |
| description | string |
| checked | boolean |
| parallel | boolean |
| userStory | string (US1, US2...) |
| phase | string |

**Decision**:
| Field | Type |
|-------|------|
| heading | string |
| content | string |
| rationale | string (optional) |
| alternatives | string (optional) |

**GWTScenario**:
| Field | Type |
|-------|------|
| given | string |
| when | string |
| then | string |

---

### Comment

An annotation attached to a specific element. Persisted as markdown files in the speckit directory.

| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Unique comment identifier |
| elementId | string | Target element ID or heading (e.g., `FR-001`, `User Story 2`) |
| artifactType | ArtifactType | Which artifact the target element belongs to |
| content | string | Comment text |
| createdAt | Date | When the comment was created |
| updatedAt | Date | When the comment was last modified |

**Storage**: Persisted in per-artifact comment files at `.claude/specs/<branch>/comments/<artifact>-comments.md`. File format uses element ID as H2 heading, comments as timestamped bullet items underneath.

**Validation rules**:
- `elementId` must reference an element that exists (or existed) in the target artifact
- `content` must not be empty
- Comments referencing elements that no longer exist are displayed with a "stale reference" indicator

---

### EditableField

Defines which fields on an element can be edited through form controls.

| Field | Type | Description |
|-------|------|-------------|
| fieldName | string | Name of the editable field (e.g., `checked`, `priority`, `text`) |
| fieldType | FieldType (enum) | checkbox, dropdown, text |
| options | string[] (optional) | Valid values for dropdown fields |
| position | Position | Byte range in source file for this field's value |

---

## Enums

### Phase
| Value | Detection Rule |
|-------|---------------|
| specify | Only spec.md exists (no plan.md, no tasks.md) |
| plan | plan.md exists (no tasks.md) |
| tasks | tasks.md exists (no tasks have in-progress/checked status) |
| implement | tasks.md exists AND at least one task is checked (`[x]`) |
| unknown | No recognized artifacts found |

### ArtifactType
**v1**: `spec` | `plan` | `tasks` | `research`
**Future**: `data-model` | `checklist` (no dedicated parsers in v1; rendered as raw markdown if present)

### ElementType
`user-story` | `requirement` | `success-criterion` | `task` | `decision` | `section` | `edge-case`

### FieldType
`checkbox` | `dropdown` | `text`

---

## Relationships

```text
Project (1) ──── (0..1) Feature
Feature (1) ──── (1..*) Artifact
Artifact (1) ──── (0..*) Element
Element (1) ──── (0..*) Comment
Element (1) ──── (0..*) EditableField
```

- A Project has at most one active Feature (the checked-out branch)
- A Feature has one or more Artifacts (at minimum spec.md to be recognized)
- An Artifact has zero or more Elements (malformed files may parse to few/no elements)
- An Element may have zero or more Comments
- An Element has zero or more EditableFields (some elements are read-only)

## Config File Structure

`~/.spec-board/config.json`:
```json
{
  "projects": [
    {
      "id": "uuid-here",
      "name": "my-project",
      "path": "/Users/dev/my-project"
    }
  ]
}
```
