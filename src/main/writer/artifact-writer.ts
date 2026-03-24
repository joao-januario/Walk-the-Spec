import fs from 'fs';
import { spliceAtPosition } from './markdown-serializer.js';

/**
 * Toggle a task checkbox in a tasks.md file.
 * Finds the line matching the task ID and replaces [ ] with [x] or vice versa.
 */
export function editTaskCheckbox(filePath: string, taskId: string, checked: boolean): void {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Find the task line by ID pattern: "- [ ] T001" or "- [x] T001"
  const pattern = new RegExp(`^(- \\[)[ x](\\] ${taskId})`, 'm');
  const match = content.match(pattern);
  if (!match || match.index === undefined) {
    throw new Error(`Task ${taskId} not found in file`);
  }

  // The checkbox char is at match.index + 3 (after "- [")
  const checkboxOffset = match.index + 3;
  const replacement = checked ? 'x' : ' ';
  const result = spliceAtPosition(content, checkboxOffset, checkboxOffset + 1, replacement);
  fs.writeFileSync(filePath, result);
}

/**
 * Edit a requirement's text in a spec.md file.
 * Finds "- **FR-NNN**: old text" and replaces the text portion.
 */
export function editRequirementText(filePath: string, requirementId: string, newText: string): void {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Pattern: "- **FR-001**: some text"
  const escaped = requirementId.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const pattern = new RegExp(`^(- \\*\\*${escaped}\\*\\*: )(.+)$`, 'm');
  const match = content.match(pattern);
  if (!match || match.index === undefined) {
    throw new Error(`Requirement ${requirementId} not found in file`);
  }

  const textStart = match.index + match[1].length;
  const textEnd = textStart + match[2].length;
  const result = spliceAtPosition(content, textStart, textEnd, newText);
  fs.writeFileSync(filePath, result);
}
