import type { Root, Heading, List } from 'mdast';
import { parseMarkdown } from './markdown-parser.js';

export interface Decision {
  heading: string;
  content: string;
}

export interface PlanParseResult {
  summary: string;
  technicalContext: Record<string, string>;
  decisions: Decision[];
}

export function parsePlan(content: string): PlanParseResult {
  const tree = parseMarkdown(content);
  return {
    summary: extractSummary(tree),
    technicalContext: extractTechnicalContext(tree),
    decisions: extractDecisions(tree),
  };
}

function getTextContent(node: any): string {
  if (node.type === 'text') return node.value;
  if (node.type === 'strong') return `**${node.children.map(getTextContent).join('')}**`;
  if (node.children) return node.children.map(getTextContent).join('');
  return '';
}

function extractSummary(tree: Root): string {
  let inSummary = false;
  for (const child of tree.children) {
    if (child.type === 'heading') {
      const text = getTextContent(child);
      if (text === 'Summary') {
        inSummary = true;
        continue;
      }
      if (inSummary) return '';
    }
    if (inSummary && child.type === 'paragraph') {
      return getTextContent(child);
    }
  }
  return '';
}

function extractTechnicalContext(tree: Root): Record<string, string> {
  const context: Record<string, string> = {};
  let inContext = false;

  for (const child of tree.children) {
    if (child.type === 'heading') {
      const text = getTextContent(child);
      if (text === 'Technical Context') {
        inContext = true;
        continue;
      }
      if (inContext && child.depth <= 2) {
        inContext = false;
      }
    }

    if (inContext && child.type === 'paragraph') {
      const text = getTextContent(child);
      // Pattern: **Key**: Value
      const lines = text.split('\n');
      for (const line of lines) {
        const match = line.match(/\*\*(.+?)\*\*:\s*(.+)/);
        if (match) {
          context[match[1]] = match[2].trim();
        }
      }
    }
  }

  return context;
}

function extractDecisions(tree: Root): Decision[] {
  const decisions: Decision[] = [];

  // Look for "Structure Decision" or any heading with "Decision" in it
  for (let i = 0; i < tree.children.length; i++) {
    const child = tree.children[i];
    if (child.type === 'paragraph') {
      const text = getTextContent(child);
      const match = text.match(/\*\*Structure Decision\*\*:\s*(.+)/);
      if (match) {
        decisions.push({
          heading: 'Structure Decision',
          content: match[1].trim(),
        });
      }
    }
  }

  return decisions;
}
