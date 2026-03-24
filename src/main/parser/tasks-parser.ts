import type { Root, Heading, List, ListItem } from 'mdast';
import { parseMarkdown } from './markdown-parser.js';

export interface TaskItem {
  id: string;
  description: string;
  checked: boolean;
  parallel: boolean;
  userStory: string | null;
}

export interface Phase {
  name: string;
  tasks: TaskItem[];
}

export interface TasksParseResult {
  phases: Phase[];
}

export function parseTasks(content: string): TasksParseResult {
  const tree = parseMarkdown(content);
  return {
    phases: extractPhases(tree),
  };
}

function getTextContent(node: any): string {
  if (node.type === 'text') return node.value;
  if (node.children) return node.children.map(getTextContent).join('');
  return '';
}

function extractPhases(tree: Root): Phase[] {
  const phases: Phase[] = [];
  let currentPhase: Phase | null = null;

  for (const child of tree.children) {
    if (child.type === 'heading' && child.depth === 2) {
      const text = getTextContent(child);
      if (text.startsWith('Phase') || text.startsWith('Format') || text.startsWith('Path') || text.startsWith('Dependencies') || text.startsWith('Parallel') || text.startsWith('Implementation') || text.startsWith('Notes')) {
        if (text.startsWith('Phase')) {
          currentPhase = { name: text, tasks: [] };
          phases.push(currentPhase);
        } else {
          currentPhase = null;
        }
        continue;
      }
    }

    // Also catch h3 subsections within a phase (e.g., "### Implementation for User Story 1")
    if (currentPhase && child.type === 'list') {
      for (const item of (child as List).children) {
        const listItem = item as ListItem;
        const text = getTextContent(listItem);
        const task = parseTaskLine(text, listItem.checked);
        if (task) {
          currentPhase.tasks.push(task);
        }
      }
    }
  }

  return phases;
}

function parseTaskLine(text: string, checked: boolean | null | undefined): TaskItem | null {
  // Pattern: T### [P?] [US#?] Description
  const match = text.match(/^(T\d+)\s+(?:\[P\]\s+)?(?:\[(US\d+)\]\s+)?(.+)/);
  if (!match) return null;

  const id = match[1];
  const userStory = match[2] ?? null;
  const description = match[3].trim();
  const parallel = text.includes('[P]');

  return {
    id,
    description,
    checked: checked === true,
    parallel,
    userStory,
  };
}
