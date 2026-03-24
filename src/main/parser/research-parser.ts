import type { Root, Heading } from 'mdast';
import { parseMarkdown } from './markdown-parser.js';

export interface ResearchDecision {
  heading: string;
  decision: string;
  rationale: string;
  alternatives: string[];
}

export interface ResearchParseResult {
  decisions: ResearchDecision[];
}

export function parseResearch(content: string): ResearchParseResult {
  const tree = parseMarkdown(content);
  return {
    decisions: extractDecisions(tree),
  };
}

function getTextContent(node: any): string {
  if (node.type === 'text') return node.value;
  if (node.type === 'strong') return `**${node.children.map(getTextContent).join('')}**`;
  if (node.children) return node.children.map(getTextContent).join('');
  return '';
}

function extractDecisions(tree: Root): ResearchDecision[] {
  const decisions: ResearchDecision[] = [];
  const decisionHeadings: { text: string; index: number }[] = [];

  tree.children.forEach((child, index) => {
    if (child.type === 'heading' && child.depth === 2) {
      const text = getTextContent(child);
      if (text.startsWith('Decision')) {
        decisionHeadings.push({ text, index });
      }
    }
  });

  for (const { text: heading, index } of decisionHeadings) {
    let decision = '';
    let rationale = '';
    const alternatives: string[] = [];

    // Find the next h2 boundary
    let endIndex = tree.children.length;
    for (let i = index + 1; i < tree.children.length; i++) {
      if (tree.children[i].type === 'heading' && (tree.children[i] as Heading).depth === 2) {
        endIndex = i;
        break;
      }
    }

    for (let i = index + 1; i < endIndex; i++) {
      const child = tree.children[i];
      if (child.type === 'paragraph') {
        const pText = getTextContent(child);
        if (pText.startsWith('**Decision**:')) {
          decision = pText.replace(/^\*\*Decision\*\*:\s*/, '').trim();
        } else if (pText.startsWith('**Rationale**:')) {
          rationale = pText.replace(/^\*\*Rationale\*\*:\s*/, '').trim();
        }
      }

      if (child.type === 'list') {
        // Check if previous paragraph was "Alternatives considered"
        if (i > 0) {
          const prev = tree.children[i - 1];
          if (prev.type === 'paragraph') {
            const prevText = getTextContent(prev);
            if (prevText.includes('Alternatives considered')) {
              for (const item of (child as any).children) {
                const itemText = getTextContent(item);
                const match = itemText.match(/\*\*(.+?)\*\*:\s*(.+)/);
                if (match) {
                  alternatives.push(`${match[1]}: ${match[2].trim()}`);
                }
              }
            }
          }
        }
      }
    }

    decisions.push({ heading, decision, rationale, alternatives });
  }

  return decisions;
}
