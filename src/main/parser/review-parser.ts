import type { Heading, Root, RootContent } from 'mdast';
import { parseMarkdown } from './markdown-parser.js';

export type FindingSeverity = 'NEEDS_REFACTOR' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type FindingStatus = 'unfixed' | 'FIXED' | 'SKIPPED' | 'MANUAL';

export interface CodeSnippet {
  label: string;
  language: string;
  code: string;
}

export interface ReviewFinding {
  number: number;
  ruleId: string;
  severity: FindingSeverity;
  location: string;
  summary: string;
  fix: string;
  why: string;
  gain: string;
  codeBlocks: CodeSnippet[];
  status: FindingStatus;
}

export interface HealFindingStatus {
  number: number;
  ruleId: string;
  status: FindingStatus;
  notes: string;
}

export interface HealSummary {
  date: string;
  appliedCount: number;
  skippedCount: number;
  revertedCount: number;
  findings: HealFindingStatus[];
}

export interface ReviewParseResult {
  branch: string;
  findings: ReviewFinding[];
  healSummary: HealSummary | null;
}

const HEAL_STATUS_ROW = /^\|\s*(\d+)\s*\|\s*(\S+)\s*\|\s*(\S+)\s*\|\s*(.+?)\s*\|$/;

const SEVERITIES: FindingSeverity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NEEDS_REFACTOR'];
const SEVERITY_PATTERN = SEVERITIES.join('|');

// --- AST helpers (same trivial functions as plan-parser.ts, kept private) ---

function getTextContent(node: any): string {
  if (node.type === 'text') return node.value;
  if (node.type === 'inlineCode') return node.value;
  if (node.children) return node.children.map(getTextContent).join('');
  return '';
}

function isHeading(node: RootContent): node is Heading {
  return node.type === 'heading';
}

// --- AST-based section and heading detection ---

interface SectionBounds {
  startOffset: number;
  endOffset: number;
  headingDepth: number;
}

function findFindingsSection(tree: Root, content: string): SectionBounds | null {
  let sectionStart: number | null = null;
  let sectionDepth = 0;
  let sectionEnd = content.length;

  for (const child of tree.children) {
    if (!isHeading(child) || !child.position) continue;

    const text = getTextContent(child).trim();
    const offset = child.position.start.offset ?? 0;

    if (sectionStart === null) {
      if (text === 'Findings') {
        sectionStart = child.position.end.offset ?? offset;
        sectionDepth = child.depth;
      }
    } else if (child.depth <= sectionDepth) {
      sectionEnd = offset;
      break;
    }
  }

  if (sectionStart === null) return null;
  return { startOffset: sectionStart, endOffset: sectionEnd, headingDepth: sectionDepth };
}

interface FindingHeading {
  text: string;
  startOffset: number;
  endOffset: number;
}

function findFindingHeadings(
  tree: Root,
  section: SectionBounds,
  content: string,
): FindingHeading[] {
  const headings: FindingHeading[] = [];

  for (const child of tree.children) {
    if (!isHeading(child) || !child.position) continue;
    const offset = child.position.start.offset ?? 0;
    if (offset < section.startOffset || offset >= section.endOffset) continue;
    // Accept any heading deeper than the section heading (handles H4 under ### and H3/H4 under ##)
    if (child.depth > section.headingDepth) {
      headings.push({
        text: getTextContent(child),
        startOffset: child.position.end.offset ?? offset,
        endOffset: section.endOffset, // will be narrowed below
      });
    }
  }

  // Narrow endOffset to the start of the next heading
  for (let i = 0; i < headings.length - 1; i++) {
    headings[i].endOffset = headings[i + 1].startOffset;
  }

  return headings;
}

// --- Heading classification ---

interface HeadingParseResult {
  number: number;
  ruleId: string;
  summary: string;
  severity?: FindingSeverity;
}

const CANONICAL_HEADING = /^Finding\s+#(\d+):\s*(\S+)\s*[—–-]\s*(.+)/;
const SEVERITY_HEADING = new RegExp(
  `^(${SEVERITY_PATTERN})[- ](\\d+)[:.:]\\s*(.+)`,
);

function classifyFindingHeading(text: string, sequentialNumber: number): HeadingParseResult | null {
  // Pattern 1: Canonical — "Finding #1: RULEID — Summary"
  const canonical = text.match(CANONICAL_HEADING);
  if (canonical) {
    return {
      number: parseInt(canonical[1], 10),
      ruleId: canonical[2],
      summary: canonical[3].trim(),
    };
  }

  // Pattern 2: Severity-ID — "HIGH-1: Summary" or "MEDIUM-1: Summary"
  const sevMatch = text.match(SEVERITY_HEADING);
  if (sevMatch) {
    const severity = sevMatch[1] as FindingSeverity;
    const headingId = `${sevMatch[1]}-${sevMatch[2]}`;
    return {
      number: sequentialNumber,
      ruleId: headingId,
      summary: sevMatch[3].trim(),
      severity,
    };
  }

  // Pattern 3: Loose numbered — "#1: RULEID — Summary" or "1: RULEID — Summary"
  const loose = text.match(/^#?(\d+):\s*(\S+)\s*[—–-]\s*(.+)/);
  if (loose) {
    return {
      number: parseInt(loose[1], 10),
      ruleId: loose[2],
      summary: loose[3].trim(),
    };
  }

  return null;
}

// --- Flexible field extraction from raw block text ---

function stripBulletPrefix(line: string): string {
  return line.replace(/^[-*]\s+/, '');
}

function stripBackticks(value: string): string {
  return value.replace(/^`|`$/g, '');
}

function extractFieldsFromBlock(rawBlock: string): {
  fields: Partial<ReviewFinding>;
  codeBlocks: CodeSnippet[];
} {
  const lines = rawBlock.split('\n');
  const fields: Partial<ReviewFinding> = {};
  const codeBlocks: CodeSnippet[] = [];

  let currentField: 'why' | 'gain' | 'fix' | 'summary' | null = null;
  let inCodeBlock = false;
  let codeLanguage = '';
  let codeLines: string[] = [];

  for (const line of lines) {
    // Handle fenced code blocks
    if (inCodeBlock) {
      if (line.startsWith('```')) {
        codeBlocks.push({ label: '', language: codeLanguage, code: codeLines.join('\n') });
        inCodeBlock = false;
        codeLines = [];
        continue;
      }
      codeLines.push(line);
      continue;
    }

    if (line.startsWith('```')) {
      inCodeBlock = true;
      codeLanguage = line.slice(3).trim();
      codeLines = [];
      currentField = null;
      continue;
    }

    // Skip headings and horizontal rules within the block
    if (line.startsWith('#') || line.match(/^-{3,}$/)) continue;

    // Strip optional list prefix for field detection
    const stripped = stripBulletPrefix(line);

    // Field extraction — try multiple label aliases
    const severityMatch = stripped.match(/^\*\*Severity\*\*:\s*(.+)/);
    if (severityMatch) {
      const val = severityMatch[1].trim();
      if (SEVERITIES.includes(val as FindingSeverity)) {
        fields.severity = val as FindingSeverity;
      }
      currentField = null;
      continue;
    }

    // Location: accept **Location**: or **File**:
    const locationMatch = stripped.match(/^\*\*(?:Location|File)\*\*:\s*(.+)/);
    if (locationMatch) {
      const rawLoc = locationMatch[1].trim();
      // Try to extract from first backtick-wrapped token: `path/to/file:line`
      const backtickMatch = rawLoc.match(/^`([^`]+)`/);
      let loc = backtickMatch ? backtickMatch[1] : stripBackticks(rawLoc);
      // Handle "path:line (description)" — keep path:line, drop paren
      const parenIdx = loc.indexOf(' (');
      if (parenIdx > 0) loc = loc.slice(0, parenIdx);
      // Handle "path:line and path:line" — keep first
      const andIdx = loc.indexOf(' and ');
      if (andIdx > 0) loc = loc.slice(0, andIdx);
      fields.location = loc;
      currentField = null;
      continue;
    }

    const ruleMatch = stripped.match(/^\*\*Rule\*\*:\s*(.+)/);
    if (ruleMatch) {
      // Only use as ruleId if it looks like a short ID (e.g., "ES04"), not a description
      const ruleVal = ruleMatch[1].trim();
      if (/^\S{2,8}$/.test(ruleVal)) {
        fields.ruleId = ruleVal;
      }
      currentField = null;
      continue;
    }

    const summaryMatch = stripped.match(/^\*\*Summary\*\*:\s*(.+)/);
    if (summaryMatch) {
      fields.summary = summaryMatch[1].trim();
      currentField = 'summary';
      continue;
    }

    // Why: accept "Why this severity", "Why this matters", or just "Why"
    const whyMatch = stripped.match(/^\*\*Why(?:\s+this\s+(?:severity|matters))?\*\*:\s*(.+)/);
    if (whyMatch) {
      fields.why = whyMatch[1].trim();
      currentField = 'why';
      continue;
    }

    // Gain: accept "What you gain", "What you gain by fixing"
    const gainMatch = stripped.match(/^\*\*What you gain(?:\s+by fixing)?\*\*:\s*(.+)/);
    if (gainMatch) {
      fields.gain = gainMatch[1].trim();
      currentField = 'gain';
      continue;
    }

    // Fix field (from canonical format)
    const fixMatch = stripped.match(/^\*\*Fix\*\*:\s*(.+)/);
    if (fixMatch) {
      fields.fix = fixMatch[1].trim();
      currentField = 'fix';
      continue;
    }

    // Multi-line continuation for current field
    if (currentField && !stripped.startsWith('**')) {
      if (line.trim()) {
        const prev = (fields[currentField] as string) ?? '';
        (fields as any)[currentField] = prev ? prev + '\n' + line : line;
      } else if (fields[currentField]) {
        // Empty line: paragraph break
        (fields as any)[currentField] = (fields[currentField] as string) + '\n';
      }
    } else if (stripped.startsWith('**')) {
      // Unknown bold field — reset continuation
      currentField = null;
    }
  }

  return { fields, codeBlocks };
}

// --- Main entry point ---

export function parseReview(content: string): ReviewParseResult {
  if (!content.trim()) {
    return { branch: '', findings: [], healSummary: null };
  }

  const tree = parseMarkdown(content);
  const lines = content.split('\n').map((l) => l.replace(/\r$/, ''));
  const branch = extractBranch(lines);
  const section = findFindingsSection(tree, content);

  let findings: ReviewFinding[] = [];
  if (section) {
    // Try block-based extraction first (handles both canonical and freeform formats)
    findings = extractFindingsFromBlocks(tree, section, content);
    // Fall back to table extraction
    if (findings.length === 0) {
      findings = extractFindingsFromTable(section, content);
    }
  }

  const healSummary = extractHealSummary(lines);

  // Apply heal status to findings
  if (healSummary) {
    for (const hs of healSummary.findings) {
      const finding = findings.find((f) => f.number === hs.number);
      if (finding) {
        finding.status = hs.status;
      }
    }
  }

  return { branch, findings, healSummary };
}

// --- Branch extraction ---

function extractBranch(lines: string[]): string {
  for (const line of lines) {
    const match = line.match(/^\*\*Branch\*\*:\s*(.+)/);
    if (match) return stripBackticks(match[1].trim());
  }
  return '';
}

// --- Block-based finding extraction (canonical + freeform) ---

function extractFindingsFromBlocks(
  tree: Root,
  section: SectionBounds,
  content: string,
): ReviewFinding[] {
  const headings = findFindingHeadings(tree, section, content);
  if (headings.length === 0) return [];

  const findings: ReviewFinding[] = [];
  let seqNumber = 1;

  for (const heading of headings) {
    const parsed = classifyFindingHeading(heading.text, seqNumber);
    if (!parsed) continue;

    const rawBlock = content.slice(heading.startOffset, heading.endOffset);
    const { fields, codeBlocks } = extractFieldsFromBlock(rawBlock);

    findings.push({
      number: parsed.number,
      ruleId: fields.ruleId ?? parsed.ruleId,
      severity: fields.severity ?? parsed.severity ?? 'MEDIUM',
      location: fields.location ?? '',
      summary: parsed.summary || fields.summary || '',
      fix: (fields.fix ?? '').trim(),
      why: (fields.why ?? '').trim(),
      gain: (fields.gain ?? '').trim(),
      codeBlocks,
      status: 'unfixed',
    });

    seqNumber++;
  }

  return findings;
}

// --- Table-based finding extraction (legacy format) ---

function extractFindingsFromTable(section: SectionBounds, content: string): ReviewFinding[] {
  const findings: ReviewFinding[] = [];
  const sectionContent = content.slice(section.startOffset, section.endOffset);
  const lines = sectionContent.split('\n');

  for (const line of lines) {
    const cells = line.split('|').map((c) => c.trim()).filter(Boolean);
    if (cells.length >= 6 && /^\d+$/.test(cells[0])) {
      findings.push({
        number: parseInt(cells[0], 10),
        ruleId: cells[1],
        severity: cells[2] as FindingSeverity,
        location: cells[3],
        summary: cells[4],
        fix: cells[5],
        why: '',
        gain: '',
        codeBlocks: [],
        status: 'unfixed',
      });
    }
  }

  return findings;
}

// --- Heal summary extraction (unchanged) ---

function extractHealSummary(lines: string[]): HealSummary | null {
  let inHeal = false;
  let date = '';
  let applied = 0;
  let skipped = 0;
  let reverted = 0;
  const healFindings: HealFindingStatus[] = [];

  for (const line of lines) {
    if (line.trim() === '## Heal Summary') {
      inHeal = true;
      continue;
    }

    if (inHeal) {
      const dateMatch = line.match(/^\*\*Date\*\*:\s*(.+)/);
      if (dateMatch) { date = dateMatch[1].trim(); continue; }

      const appliedMatch = line.match(/^\*\*Applied\*\*:\s*(\d+)/);
      if (appliedMatch) { applied = parseInt(appliedMatch[1], 10); continue; }

      const skippedMatch = line.match(/^\*\*Skipped\*\*:\s*(\d+)/);
      if (skippedMatch) { skipped = parseInt(skippedMatch[1], 10); continue; }

      const revertedMatch = line.match(/^\*\*Reverted\*\*:\s*(\d+)/);
      if (revertedMatch) { reverted = parseInt(revertedMatch[1], 10); continue; }

      const statusMatch = line.match(HEAL_STATUS_ROW);
      if (statusMatch) {
        healFindings.push({
          number: parseInt(statusMatch[1], 10),
          ruleId: statusMatch[2],
          status: statusMatch[3] as FindingStatus,
          notes: statusMatch[4].trim(),
        });
      }
    }
  }

  if (!inHeal) return null;
  return { date, appliedCount: applied, skippedCount: skipped, revertedCount: reverted, findings: healFindings };
}
