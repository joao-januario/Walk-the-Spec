import type { Root } from 'mdast';
import { parseMarkdown } from './markdown-parser.js';

export interface ArchitectureDecision {
  heading: string;
  decision: string;
  rationale: string;
  alternativesRejected: string;
}

// Legacy type kept for backward compat
export interface Decision {
  heading: string;
  content: string;
}

export interface PlanParseResult {
  summary: string;
  technicalApproach: string;
  technicalContext: Record<string, string>;
  architectureDecisions: ArchitectureDecision[];
  fileStructure: string;
  decisions: Decision[];
}

export function parsePlan(content: string): PlanParseResult {
  const tree = parseMarkdown(content);
  const technicalApproach = extractTechnicalApproach(tree);
  const technicalContext = technicalApproach ? {} : extractTechnicalContext(tree);
  const architectureDecisions = extractArchitectureDecisions(tree);
  const legacyDecisions = architectureDecisions.length > 0 ? [] : extractLegacyDecisions(tree);

  return {
    summary: extractSummary(tree),
    technicalApproach,
    technicalContext,
    architectureDecisions,
    fileStructure: extractFileStructure(tree),
    decisions: legacyDecisions,
  };
}

function getTextContent(node: any): string {
  if (node.type === 'text') return node.value;
  if (node.type === 'strong') return `**${node.children.map(getTextContent).join('')}**`;
  if (node.type === 'inlineCode') return node.value;
  if (node.children) return node.children.map(getTextContent).join('');
  return '';
}

function extractSummary(tree: Root): string {
  let inSummary = false;
  const parts: string[] = [];
  for (const child of tree.children) {
    if (child.type === 'heading') {
      const text = getTextContent(child);
      if (text === 'Summary') {
        inSummary = true;
        continue;
      }
      if (inSummary) break;
    }
    if (inSummary && child.type === 'paragraph') {
      parts.push(getTextContent(child));
    }
  }
  return parts.join('\n\n');
}

function extractTechnicalApproach(tree: Root): string {
  let inSection = false;
  const parts: string[] = [];
  for (const child of tree.children) {
    if (child.type === 'heading') {
      const text = getTextContent(child);
      if (text === 'Technical Approach') {
        inSection = true;
        continue;
      }
      if (inSection && child.depth <= 2) break;
    }
    if (inSection && child.type === 'paragraph') {
      parts.push(getTextContent(child));
    }
  }
  return parts.join('\n\n');
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

function extractArchitectureDecisions(tree: Root): ArchitectureDecision[] {
  const decisions: ArchitectureDecision[] = [];
  let inSection = false;
  let currentDecision: Partial<ArchitectureDecision> | null = null;
  let currentField: 'decision' | 'rationale' | 'alternativesRejected' | null = null;

  for (const child of tree.children) {
    if (child.type === 'heading') {
      const text = getTextContent(child);
      if (text === 'Architecture Decisions') {
        inSection = true;
        continue;
      }
      if (inSection && child.depth <= 2) {
        if (currentDecision?.heading) {
          decisions.push(finalizeDecision(currentDecision));
        }
        inSection = false;
        continue;
      }
      if (inSection && child.depth === 3) {
        if (currentDecision?.heading) {
          decisions.push(finalizeDecision(currentDecision));
        }
        // Strip leading number + dot (e.g., "1. Review finding format...")
        const heading = text.replace(/^\d+\.\s*/, '');
        currentDecision = { heading, decision: '', rationale: '', alternativesRejected: '' };
        currentField = null;
        continue;
      }
    }

    if (inSection && currentDecision && child.type === 'paragraph') {
      const text = getTextContent(child);

      if (text.startsWith('**Decision**:')) {
        currentField = 'decision';
        currentDecision.decision = text.replace(/^\*\*Decision\*\*:\s*/, '');
      } else if (text.startsWith('**Rationale**:')) {
        currentField = 'rationale';
        currentDecision.rationale = text.replace(/^\*\*Rationale\*\*:\s*/, '');
      } else if (text.startsWith('**Alternatives rejected**:')) {
        currentField = 'alternativesRejected';
        currentDecision.alternativesRejected = text.replace(/^\*\*Alternatives rejected\*\*:\s*/, '');
      } else if (text.startsWith('**Impact**:')) {
        // Impact is informational, append to rationale
        currentDecision.rationale = (currentDecision.rationale ?? '') + '\n\n' + text.replace(/^\*\*Impact\*\*:\s*/, 'Impact: ');
      } else if (currentField) {
        // Continuation paragraph for current field
        currentDecision[currentField] = (currentDecision[currentField] ?? '') + '\n\n' + text;
      }
    }
  }

  if (inSection && currentDecision?.heading) {
    decisions.push(finalizeDecision(currentDecision));
  }

  return decisions;
}

function finalizeDecision(partial: Partial<ArchitectureDecision>): ArchitectureDecision {
  return {
    heading: partial.heading ?? '',
    decision: (partial.decision ?? '').trim(),
    rationale: (partial.rationale ?? '').trim(),
    alternativesRejected: (partial.alternativesRejected ?? '').trim(),
  };
}

function extractFileStructure(tree: Root): string {
  let inSection = false;
  const blocks: string[] = [];

  for (const child of tree.children) {
    if (child.type === 'heading') {
      const text = getTextContent(child);
      if (text === 'Project Structure' || text === 'Files modified') {
        inSection = true;
        continue;
      }
      if (text.includes('Files modified') || text.includes('Source Code')) {
        inSection = true;
        continue;
      }
      if (inSection && child.depth <= 2) {
        // Reached next top-level section — stop collecting
        break;
      }
    }
    if (inSection && child.type === 'code') {
      blocks.push(child.value);
    }
  }

  return blocks.join('\n\n');
}

function extractLegacyDecisions(tree: Root): Decision[] {
  const decisions: Decision[] = [];

  for (const child of tree.children) {
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
