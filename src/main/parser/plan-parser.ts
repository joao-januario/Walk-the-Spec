import type { Code, Heading, Paragraph, Root, RootContent } from 'mdast';
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
  const technicalApproach = extractTechnicalApproach(tree, content);
  const technicalContext = technicalApproach ? {} : extractTechnicalContext(tree);
  const architectureDecisions = extractArchitectureDecisions(tree, content);
  const legacyDecisions = architectureDecisions.length > 0 ? [] : extractLegacyDecisions(tree);

  return {
    summary: extractSummary(tree, content),
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
  if (node.type === 'inlineCode') return `\`${node.value}\``;
  if (node.children) return node.children.map(getTextContent).join('');
  return '';
}

function isHeading(node: RootContent): node is Heading { return node.type === 'heading'; }
function isParagraph(node: RootContent): node is Paragraph { return node.type === 'paragraph'; }
function isCode(node: RootContent): node is Code { return node.type === 'code'; }

const H2_LINE = /^##\s+[^\n]*\n*/;
const H3_LINE = /^###\s+[^\n]*\n*/;

// --- Raw slicing extraction (preserves ALL markdown) ---

function extractSummary(tree: Root, content: string): string {
  let startOffset: number | null = null;
  let endOffset = content.length;

  for (const child of tree.children) {
    if (!isHeading(child) || !child.position) continue;

    if (startOffset === null) {
      if (child.depth === 2 && getTextContent(child) === 'Summary') {
        startOffset = child.position.start.offset ?? 0;
      }
    } else {
      // Break on ANY heading (matches original behavior)
      endOffset = child.position.start.offset ?? content.length;
      break;
    }
  }

  if (startOffset === null) return '';
  return content.slice(startOffset, endOffset).replace(H2_LINE, '').trim();
}

function extractTechnicalApproach(tree: Root, content: string): string {
  let startOffset: number | null = null;
  let endOffset = content.length;

  for (const child of tree.children) {
    if (!isHeading(child) || !child.position) continue;

    if (startOffset === null) {
      if (child.depth === 2 && getTextContent(child) === 'Technical Approach') {
        startOffset = child.position.start.offset ?? 0;
      }
    } else {
      // Break on H2 or shallower (preserves H3 sub-headings within)
      if (child.depth <= 2) {
        endOffset = child.position.start.offset ?? content.length;
        break;
      }
    }
  }

  if (startOffset === null) return '';
  return content.slice(startOffset, endOffset).replace(H2_LINE, '').trim();
}

// --- Hybrid extraction for Architecture Decisions ---

const FIELD_MARKER_RE = /^\*\*(?:Decision|Rationale|Alternatives rejected|Impact)\*\*:/gm;

interface DecisionFields {
  decision: string;
  rationale: string;
  alternativesRejected: string;
}

function extractDecisionFields(body: string): DecisionFields {
  const result: DecisionFields = { decision: '', rationale: '', alternativesRejected: '' };

  const markers: { field: string; index: number }[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(FIELD_MARKER_RE.source, 'gm');
  while ((match = re.exec(body)) !== null) {
    markers.push({ field: match[0], index: match.index });
  }

  for (let i = 0; i < markers.length; i++) {
    const marker = markers[i]!;
    const valueStart = marker.index + marker.field.length;
    const valueEnd = markers[i + 1]?.index ?? body.length;
    const value = body.slice(valueStart, valueEnd).trim();

    if (marker.field === '**Decision**:') {
      result.decision = value;
    } else if (marker.field === '**Rationale**:') {
      result.rationale = value;
    } else if (marker.field === '**Alternatives rejected**:') {
      result.alternativesRejected = value;
    } else if (marker.field === '**Impact**:') {
      // Impact is informational, append to rationale (matches original behavior)
      result.rationale = result.rationale
        ? result.rationale + '\n\nImpact: ' + value
        : 'Impact: ' + value;
    }
  }

  return result;
}

function extractArchitectureDecisions(tree: Root, content: string): ArchitectureDecision[] {
  // Phase 1: Find H2 "Architecture Decisions" boundaries
  let sectionStart: number | null = null;
  let sectionEnd = content.length;

  for (const child of tree.children) {
    if (!isHeading(child) || !child.position) continue;

    if (sectionStart === null) {
      if (child.depth === 2 && getTextContent(child) === 'Architecture Decisions') {
        sectionStart = child.position.start.offset ?? 0;
      }
    } else if (child.depth <= 2) {
      sectionEnd = child.position.start.offset ?? content.length;
      break;
    }
  }

  if (sectionStart === null) return [];

  // Phase 2: Find H3 sub-headings within the section
  const h3s: { text: string; offset: number }[] = [];
  for (const child of tree.children) {
    if (!isHeading(child) || !child.position) continue;
    const offset = child.position.start.offset ?? 0;
    if (offset <= sectionStart || offset >= sectionEnd) continue;
    if (child.depth === 3) {
      h3s.push({ text: getTextContent(child), offset });
    }
  }

  // Phase 3: Slice per H3 and extract fields via regex
  return h3s.map((h3, i) => {
    const endBoundary = h3s[i + 1]?.offset ?? sectionEnd;
    const raw = content.slice(h3.offset, endBoundary);
    const body = raw.replace(H3_LINE, '').trim();
    const heading = h3.text.replace(/^\d+\.\s*/, '');

    return { heading, ...extractDecisionFields(body) };
  });
}

// --- Legacy/unchanged extraction functions ---

function extractTechnicalContext(tree: Root): Record<string, string> {
  const context: Record<string, string> = {};
  let inContext = false;

  for (const child of tree.children) {
    if (isHeading(child)) {
      const text = getTextContent(child);
      if (text === 'Technical Context') {
        inContext = true;
        continue;
      }
      if (inContext && child.depth <= 2) {
        inContext = false;
      }
    }

    if (inContext && isParagraph(child)) {
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

function extractFileStructure(tree: Root): string {
  let inSection = false;
  const blocks: string[] = [];

  for (const child of tree.children) {
    if (isHeading(child)) {
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
        break;
      }
    }
    if (inSection && isCode(child)) {
      blocks.push(child.value);
    }
  }

  return blocks.join('\n\n');
}

function extractLegacyDecisions(tree: Root): Decision[] {
  const decisions: Decision[] = [];

  for (const child of tree.children) {
    if (isParagraph(child)) {
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
