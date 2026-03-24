import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { parseMarkdown } from '../../../src/main/parser/markdown-parser.js';

const FIXTURES = path.join(__dirname, '../../fixtures');

describe('markdown-parser', () => {
  it('parses spec.md to mdast AST with position data', () => {
    const content = fs.readFileSync(path.join(FIXTURES, 'spec.md'), 'utf-8');
    const tree = parseMarkdown(content);

    expect(tree.type).toBe('root');
    expect(tree.children.length).toBeGreaterThan(0);
    // First child should be a heading
    expect(tree.children[0].type).toBe('heading');
    // Position data must exist
    expect(tree.children[0].position).toBeDefined();
    expect(tree.children[0].position!.start.line).toBe(1);
  });

  it('parses GFM checkboxes in tasks.md', () => {
    const content = fs.readFileSync(path.join(FIXTURES, 'tasks.md'), 'utf-8');
    const tree = parseMarkdown(content);

    // Find list items with checked property
    const listItems = findNodes(tree, 'listItem');
    const checked = listItems.filter((n: any) => n.checked === true);
    const unchecked = listItems.filter((n: any) => n.checked === false);

    expect(checked.length).toBeGreaterThan(0);
    expect(unchecked.length).toBeGreaterThan(0);
  });

  it('parses YAML frontmatter in tasks.md', () => {
    const content = fs.readFileSync(path.join(FIXTURES, 'tasks.md'), 'utf-8');
    const tree = parseMarkdown(content);

    const yamlNodes = tree.children.filter((n: any) => n.type === 'yaml');
    expect(yamlNodes.length).toBe(1);
    expect((yamlNodes[0] as any).value).toContain('description');
  });

  it('preserves position offsets for all nodes', () => {
    const content = '# Hello\n\nSome text\n\n- item 1\n- item 2\n';
    const tree = parseMarkdown(content);

    for (const child of tree.children) {
      expect(child.position).toBeDefined();
      expect(child.position!.start.offset).toBeDefined();
      expect(child.position!.end.offset).toBeDefined();
    }
  });
});

// Helper to recursively find nodes by type
function findNodes(tree: any, type: string): any[] {
  const results: any[] = [];
  function walk(node: any) {
    if (node.type === type) results.push(node);
    if (node.children) node.children.forEach(walk);
  }
  walk(tree);
  return results;
}
