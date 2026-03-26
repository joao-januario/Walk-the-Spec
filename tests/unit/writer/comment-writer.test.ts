import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  writeComment,
  updateComment,
  deleteComment,
} from '../../../src/main/writer/comment-writer.js';

const TEST_DIR = path.join(os.tmpdir(), '.walk-the-spec-comment-writer-test-' + Date.now());

describe('comment-writer', () => {
  beforeEach(() => fs.mkdirSync(TEST_DIR, { recursive: true }));
  afterEach(() => { if (fs.existsSync(TEST_DIR)) fs.rmSync(TEST_DIR, { recursive: true }); });

  it('creates a new comment file when none exists', () => {
    const filePath = path.join(TEST_DIR, 'spec-comments.md');
    writeComment(filePath, 'spec.md', 'FR-001', 'c1', 'This is too broad.', '2026-03-24 10:30');

    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('# Comments: spec.md');
    expect(content).toContain('## FR-001');
    expect(content).toContain('{id:c1}');
    expect(content).toContain('This is too broad.');
  });

  it('appends a comment under existing element heading', () => {
    const filePath = path.join(TEST_DIR, 'spec-comments.md');
    writeComment(filePath, 'spec.md', 'FR-001', 'c1', 'First comment.', '2026-03-24 10:30');
    writeComment(filePath, 'spec.md', 'FR-001', 'c2', 'Second comment.', '2026-03-24 11:00');

    const content = fs.readFileSync(filePath, 'utf-8');
    // Should have one H2 for FR-001, two bullets
    const h2Count = (content.match(/^## FR-001$/gm) || []).length;
    expect(h2Count).toBe(1);
    expect(content).toContain('First comment.');
    expect(content).toContain('Second comment.');
  });

  it('adds a new element section for a different element', () => {
    const filePath = path.join(TEST_DIR, 'spec-comments.md');
    writeComment(filePath, 'spec.md', 'FR-001', 'c1', 'On FR-001.', '2026-03-24 10:30');
    writeComment(filePath, 'spec.md', 'FR-002', 'c2', 'On FR-002.', '2026-03-24 11:00');

    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('## FR-001');
    expect(content).toContain('## FR-002');
  });

  it('updates an existing comment by id', () => {
    const filePath = path.join(TEST_DIR, 'spec-comments.md');
    writeComment(filePath, 'spec.md', 'FR-001', 'c1', 'Original.', '2026-03-24 10:30');
    updateComment(filePath, 'c1', 'Updated text.', '2026-03-24 12:00');

    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).not.toContain('Original.');
    expect(content).toContain('Updated text.');
  });

  it('deletes a comment by id', () => {
    const filePath = path.join(TEST_DIR, 'spec-comments.md');
    writeComment(filePath, 'spec.md', 'FR-001', 'c1', 'To delete.', '2026-03-24 10:30');
    writeComment(filePath, 'spec.md', 'FR-001', 'c2', 'To keep.', '2026-03-24 11:00');
    deleteComment(filePath, 'c1');

    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).not.toContain('To delete.');
    expect(content).toContain('To keep.');
  });

  it('output matches research.md Decision 5 format', () => {
    const filePath = path.join(TEST_DIR, 'spec-comments.md');
    writeComment(filePath, 'spec.md', 'FR-001', 'c1', 'A comment.', '2026-03-24 10:30');

    const content = fs.readFileSync(filePath, 'utf-8');
    // Format: # Comments: <artifact>
    expect(content).toMatch(/^# Comments: spec\.md/m);
    // Format: ## <element ID>
    expect(content).toMatch(/^## FR-001$/m);
    // Format: - [timestamp] {id:xxx} content
    expect(content).toMatch(/^- \[2026-03-24 10:30\] \{id:c1\} A comment\.$/m);
  });
});
