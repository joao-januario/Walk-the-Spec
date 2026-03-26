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

export type OperationType = 'added' | 'modified' | 'removed' | 'unknown';

export interface FileStructureEntry {
  filePath: string;
  directory: string;
  filename: string;
  comment: string | null;
  operation: OperationType;
}

export interface FileStructureSection {
  title: string;
  entries: FileStructureEntry[];
}

export interface PlanParseResult {
  summary: string;
  technicalApproach: string;
  technicalContext: Record<string, string>;
  architectureDecisions: ArchitectureDecision[];
  fileStructure: FileStructureSection[];
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

function extractFileStructure(tree: Root): FileStructureSection[] {
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

  return parseFileStructureContent(blocks.join('\n\n'));
}

// --- File structure line parsing ---

const TREE_CHARS_RE = /[├└│─┬┤┼╔╗╚╝║═]+\s*/g;
const ADDED_KEYWORDS = /\b(?:new|add|create)\b/i;
const MODIFIED_KEYWORDS = /\b(?:update|modify|replace|change|refactor)\b/i;
const REMOVED_KEYWORDS = /\b(?:remove|delete)\b/i;

function inferOperation(text: string): OperationType {
  if (ADDED_KEYWORDS.test(text)) return 'added';
  if (MODIFIED_KEYWORDS.test(text)) return 'modified';
  if (REMOVED_KEYWORDS.test(text)) return 'removed';
  return 'unknown';
}

function splitPathAndComment(line: string): { path: string; comment: string | null } {
  // Match path followed by optional # comment (at least one space before #, space after)
  const commentMatch = line.match(/^(.+?)\s+#\s+(.+)$/);
  if (commentMatch) {
    return { path: commentMatch[1].trim(), comment: commentMatch[2].trim() };
  }
  return { path: line.trim(), comment: null };
}

function splitFilePath(filePath: string): { directory: string; filename: string } {
  const lastSlash = filePath.lastIndexOf('/');
  if (lastSlash === -1) {
    return { directory: '', filename: filePath };
  }
  return {
    directory: filePath.slice(0, lastSlash + 1),
    filename: filePath.slice(lastSlash + 1),
  };
}

function isSectionHeading(line: string): boolean {
  // A section heading is a line that starts with # and has no file path characters
  // (no dots suggesting a file extension, no slashes suggesting a path)
  const trimmed = line.trim();
  if (!trimmed.startsWith('#')) return false;
  const text = trimmed.slice(1).trim();
  // If it looks like a file path or is empty, it's not a section heading
  return text.length > 0 && !text.includes('/') && !text.match(/\.\w{1,10}$/);
}

export function parseFileStructureContent(raw: string): FileStructureSection[] {
  if (!raw.trim()) return [];

  const lines = raw.split('\n');
  const sections: FileStructureSection[] = [];
  let currentSection: FileStructureSection | null = null;
  let currentSectionHeading: string | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Check if this is a section heading (# Comment style)
    if (isSectionHeading(line)) {
      // Save previous section if it has entries
      if (currentSection && currentSection.entries.length > 0) {
        sections.push(currentSection);
      }
      currentSectionHeading = line.slice(1).trim();
      currentSection = { title: currentSectionHeading, entries: [] };
      continue;
    }

    // Strip tree-drawing characters
    let cleaned = line.replace(TREE_CHARS_RE, '').trim();
    if (!cleaned) continue;

    // Skip lines that are just directory names ending with /
    if (cleaned.endsWith('/') && !cleaned.includes('#')) continue;

    // Split into path and comment
    const { path: filePath, comment } = splitPathAndComment(cleaned);
    if (!filePath) continue;

    // Skip lines that look like template placeholders
    if (filePath.startsWith('[') && filePath.endsWith(']')) continue;

    // Infer operation: comment first, section heading fallback
    let operation: OperationType = 'unknown';
    if (comment) {
      operation = inferOperation(comment);
    }
    if (operation === 'unknown' && currentSectionHeading) {
      operation = inferOperation(currentSectionHeading);
    }

    const { directory, filename } = splitFilePath(filePath);

    // Ensure default section exists for entries before any heading
    if (!currentSection) {
      currentSection = { title: 'Files', entries: [] };
    }

    currentSection.entries.push({
      filePath,
      directory,
      filename,
      comment,
      operation,
    });
  }

  // Push the last section
  if (currentSection && currentSection.entries.length > 0) {
    sections.push(currentSection);
  }

  return sections;
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
