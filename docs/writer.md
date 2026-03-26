# Writer Area Guide

## Purpose

The writer subsystem performs surgical edits to speckit markdown files — modifying individual fields (task checkboxes, requirement text) without rewriting the entire file. It works by finding the target content via regex, calculating byte offsets, and splicing the replacement into the original string at exact positions.

## Core Operation: `spliceAtPosition`

```typescript
function spliceAtPosition(original: string, startOffset: number, endOffset: number, replacement: string): string {
  return original.slice(0, startOffset) + replacement + original.slice(endOffset);
}
```

This is the only write primitive. All edits reduce to: "replace bytes [start, end) with this string." The function is pure — it returns a new string, doesn't write to disk.

## Edit Functions

### `editTaskCheckbox(filePath, taskId, checked)`

Toggles a task's checkbox in `tasks.md`:

1. Reads the file content
2. Finds the line matching pattern: `- [ ] T001` or `- [x] T001`
3. Regex: `^(- \[)[ x](\] ${taskId})`
4. Calculates the checkbox character position: `match.index + 3` (the space/x after `[`)
5. Calls `spliceAtPosition` to replace the single character with `'x'` or `' '`
6. Writes the modified content back to the file

### `editRequirementText(filePath, requirementId, newText)`

Updates a requirement's description text in `spec.md`:

1. Reads the file content
2. Finds the line matching pattern: `- **FR-001**: some text here`
3. Regex: `^(- \*\*${escaped}\*\*: )(.+)$` (multiline)
4. Calculates the text portion offset (after the `**FR-001**: ` prefix)
5. Calls `spliceAtPosition` to replace only the text portion, preserving the prefix
6. Writes the modified content back to the file

## Edit Flow (End-to-End)

```
User clicks task checkbox in TasksView
  → TaskRow onChange handler
  → api.editField(projectId, 'tasks', taskId, 'checked', true)    [IPC]
  → handlers.ts 'edit-field' handler
  → editTaskCheckbox(filePath, taskId, true)                        [writer]
  → file written to disk
  → chokidar detects change → 'specs-changed' event
  → App.tsx increments refreshKey
  → FeatureDetail re-mounts, refetches artifact
  → TasksView re-renders with updated checkbox state
```

The edit and the UI update are decoupled — the edit writes to disk, and the file watcher triggers a re-render independently. There's no optimistic update.

## How to Add a New Edit Function

1. Add function in `src/main/writer/artifact-writer.ts`:
   ```typescript
   export function editMyField(filePath: string, elementId: string, newValue: string): void {
     const content = fs.readFileSync(filePath, 'utf-8');
     const pattern = new RegExp(/* pattern to find the field */);
     const match = pattern.exec(content);
     if (!match) throw new Error(`Element ${elementId} not found`);
     // calculate startOffset and endOffset for the value portion
     const result = spliceAtPosition(content, startOffset, endOffset, newValue);
     fs.writeFileSync(filePath, result, 'utf-8');
   }
   ```

2. Add case in `src/main/ipc/handlers.ts` `edit-field` handler:
   ```typescript
   case 'myField':
     editMyField(artifactPath, elementId, value as string);
     break;
   ```

3. Add UI trigger in the renderer component.

## Gotchas

1. **Sync file I/O**: Both edit functions use `readFileSync`/`writeFileSync`. This blocks the main process event loop briefly but is acceptable because edits are infrequent (user-triggered) and files are small.

2. **No conflict detection**: If the file is modified between read and write (race condition), the edit silently overwrites. This is unlikely in practice (single user, debounced watcher) but worth knowing.

3. **Regex escaping**: `editRequirementText` escapes the requirement ID for regex safety before building the pattern. If you add new edit functions, always escape user-provided IDs.

4. **Position sensitivity**: `spliceAtPosition` works on byte offsets in the string. If the file encoding changes or content shifts (e.g., someone adds a line above the target), the regex re-finds the target on each edit — positions are recalculated every time, not cached.

5. **Write triggers re-render**: Every file write triggers the chokidar watcher → `specs-changed` event → full re-render. There's no way to write "silently." This means rapid edits cause rapid re-renders (mitigated by the 300ms debounce in file-watcher).
