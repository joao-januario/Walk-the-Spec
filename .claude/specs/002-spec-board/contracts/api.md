# API Contracts: Spec Board

**Branch**: `002-spec-board` | **Date**: 2026-03-24

## REST API (Backend → Frontend)

Base URL: `http://localhost:{port}/api`

---

### Projects

#### `GET /api/projects`
List all registered projects with their current state.

**Response** `200`:
```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "my-project",
      "path": "/Users/dev/my-project",
      "currentBranch": "002-spec-board",
      "hasSpeckitContent": true,
      "phase": "specify"
    }
  ]
}
```

#### `POST /api/projects`
Register a new project.

**Request**:
```json
{
  "path": "/Users/dev/my-project",
  "name": "my-project"  // optional, derived from path basename if omitted
}
```

**Response** `201`:
```json
{
  "id": "uuid",
  "name": "my-project",
  "path": "/Users/dev/my-project",
  "currentBranch": "main",
  "hasSpeckitContent": false,
  "phase": "unknown"
}
```

**Errors**:
- `400`: Path does not exist or is not a git repository
- `409`: Path already registered

#### `DELETE /api/projects/:id`
Unregister a project.

**Response** `204`: No content.

---

### Features

#### `GET /api/projects/:id/feature`
Get the active feature (checked-out branch artifacts) for a project.

**Response** `200`:
```json
{
  "branchName": "002-spec-board",
  "phase": "specify",
  "specDir": "/Users/dev/my-project/.claude/specs/002-spec-board",
  "summary": "Spec Board",
  "artifacts": [
    {
      "type": "spec",
      "filePath": "spec.md",
      "lastModified": "2026-03-24T10:00:00Z",
      "elementCount": 25
    }
  ]
}
```

**Response** `404`: No speckit content on checked-out branch.

---

### Artifacts

#### `GET /api/projects/:id/artifacts/:type`
Get parsed artifact content. `:type` is one of: `spec`, `plan`, `tasks`, `research`, `data-model`, `checklist`.

**Response** `200`:
```json
{
  "type": "spec",
  "filePath": "spec.md",
  "lastModified": "2026-03-24T10:00:00Z",
  "elements": [
    {
      "id": "User Story 1",
      "type": "user-story",
      "content": {
        "number": 1,
        "title": "Register a Project and Browse Features",
        "priority": "P1",
        "description": "A developer registers...",
        "whyPriority": "This is the foundational interaction...",
        "independentTest": "Can be fully tested by...",
        "acceptanceScenarios": [
          { "given": "...", "when": "...", "then": "..." }
        ]
      },
      "editableFields": [
        { "fieldName": "priority", "fieldType": "dropdown", "options": ["P1","P2","P3","P4","P5"] },
        { "fieldName": "title", "fieldType": "text" },
        { "fieldName": "description", "fieldType": "text" }
      ],
      "commentCount": 2
    },
    {
      "id": "FR-001",
      "type": "requirement",
      "content": {
        "id": "FR-001",
        "text": "System MUST allow users to register...",
        "needsClarification": false
      },
      "editableFields": [
        { "fieldName": "text", "fieldType": "text" }
      ],
      "commentCount": 0
    }
  ]
}
```

**Response** `404`: Artifact type does not exist for this feature.

---

### Comments

#### `GET /api/projects/:id/comments/:artifactType`
Get all comments for an artifact.

**Response** `200`:
```json
{
  "artifactType": "spec",
  "comments": [
    {
      "id": "uuid",
      "elementId": "FR-001",
      "content": "This requirement seems too broad.",
      "createdAt": "2026-03-24T10:30:00Z",
      "updatedAt": "2026-03-24T10:30:00Z"
    }
  ]
}
```

#### `POST /api/projects/:id/comments/:artifactType`
Add a comment to an element.

**Request**:
```json
{
  "elementId": "FR-001",
  "content": "This requirement seems too broad."
}
```

**Response** `201`: Created comment object.

**Side effect**: Updates `comments/<artifact>-comments.md` file on disk.

#### `PUT /api/projects/:id/comments/:artifactType/:commentId`
Update a comment.

**Request**:
```json
{
  "content": "Updated comment text."
}
```

**Response** `200`: Updated comment object.

#### `DELETE /api/projects/:id/comments/:artifactType/:commentId`
Delete a comment.

**Response** `204`: No content.

---

### Edits

#### `PATCH /api/projects/:id/artifacts/:type/elements/:elementId`
Edit a structured field on an element.

**Request**:
```json
{
  "field": "checked",
  "value": true
}
```

**Response** `200`:
```json
{
  "elementId": "T001",
  "field": "checked",
  "value": true,
  "artifactModified": "2026-03-24T11:00:00Z"
}
```

**Side effect**: Updates the corresponding speckit file on disk (e.g., changes `- [ ] T001` to `- [x] T001`).

**Errors**:
- `400`: Field is not editable on this element type
- `409`: File was modified externally since last read (stale edit)

---

## WebSocket Contract (Backend → Frontend)

Connection: `ws://localhost:{port}/ws`

All messages are JSON with a `type` field.

### Server → Client Messages

#### `specs-changed`
One or more speckit files were modified on disk.

```json
{
  "type": "specs-changed",
  "projectId": "uuid",
  "files": ["spec.md", "tasks.md"],
  "timestamp": "2026-03-24T10:00:00Z"
}
```

**Client action**: Re-fetch affected artifact data.

#### `branch-changed`
The checked-out branch changed for a project.

```json
{
  "type": "branch-changed",
  "projectId": "uuid",
  "oldBranch": "main",
  "newBranch": "002-spec-board",
  "hasSpeckitContent": true,
  "phase": "specify",
  "timestamp": "2026-03-24T10:00:00Z"
}
```

**Client action**: Re-fetch project and feature data.

#### `project-error`
A registered project path is inaccessible.

```json
{
  "type": "project-error",
  "projectId": "uuid",
  "error": "Project path no longer exists",
  "timestamp": "2026-03-24T10:00:00Z"
}
```

**Client action**: Show error state on the project card.
