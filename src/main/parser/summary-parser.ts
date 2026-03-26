import type { Heading } from 'mdast';
import { parseMarkdown } from './markdown-parser.js';

const H1_LINE = /^#\s+[^\n]*\n*/;
const H2_LINE = /^##\s+[^\n]*\n*/;

export interface SummarySection {
  heading: string;
  content: string;
}

export interface SummaryParseResult {
  sections: SummarySection[];
}

function getTextContent(node: unknown): string {
  const n = node as { type: string; value?: string; children?: unknown[] };
  if (n.type === 'text') return n.value ?? '';
  if (n.children) return n.children.map(getTextContent).join('');
  return '';
}

export function parseSummary(content: string): SummaryParseResult {
  if (!content.trim()) return { sections: [] };

  const tree = parseMarkdown(content);
  const sections: SummarySection[] = [];

  // Find all H2 heading indices and their positions
  const h2Indices: { text: string; startOffset: number }[] = [];
  for (const child of tree.children) {
    if (child.type === 'heading' && (child as Heading).depth === 2 && child.position) {
      h2Indices.push({
        text: getTextContent(child),
        startOffset: child.position.start.offset ?? 0,
      });
    }
  }

  // If there's content before the first H2, capture as Introduction
  const firstH2Offset = h2Indices[0]?.startOffset ?? content.length;
  const preContent = content.slice(0, firstH2Offset).trim();
  if (preContent) {
    // Strip H1 title from introduction content but keep everything else
    const introContent = preContent.replace(H1_LINE, '').trim();
    if (introContent) {
      sections.push({ heading: 'Introduction', content: introContent });
    }
  }

  // Process each H2 section
  for (let i = 0; i < h2Indices.length; i++) {
    const current = h2Indices[i]!;
    const nextOffset = h2Indices[i + 1]?.startOffset ?? content.length;
    const sectionRaw = content.slice(current.startOffset, nextOffset);

    // Strip the H2 heading line itself from the content
    const contentAfterHeading = sectionRaw.replace(H2_LINE, '').trim();

    sections.push({
      heading: current.text,
      content: contentAfterHeading,
    });
  }

  return { sections };
}
