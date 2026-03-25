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

// No regex — we split on | for robustness
const HEAL_STATUS_ROW = /^\|\s*(\d+)\s*\|\s*(\S+)\s*\|\s*(\S+)\s*\|\s*(.+?)\s*\|$/;

export function parseReview(content: string): ReviewParseResult {
  if (!content.trim()) {
    return { branch: '', findings: [], healSummary: null };
  }

  const lines = content.split('\n').map((l) => l.replace(/\r$/, ''));
  const branch = extractBranch(lines);

  // Try block-based extraction first (new format), fall back to table (old format)
  let findings = extractFindingsFromBlocks(lines);
  if (findings.length === 0) {
    findings = extractFindings(lines);
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

function extractBranch(lines: string[]): string {
  for (const line of lines) {
    const match = line.match(/^\*\*Branch\*\*:\s*(.+)/);
    if (match) return match[1].trim();
  }
  return '';
}

function extractFindings(lines: string[]): ReviewFinding[] {
  const findings: ReviewFinding[] = [];
  let inFindings = false;

  for (const line of lines) {
    if (line.trim() === '### Findings') {
      inFindings = true;
      continue;
    }
    if (inFindings && line.startsWith('###')) {
      inFindings = false;
      continue;
    }

    if (inFindings) {
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
  }

  return findings;
}

function extractFindingsFromBlocks(lines: string[]): ReviewFinding[] {
  const findings: ReviewFinding[] = [];
  const FINDING_HEADING = /^####\s+Finding\s+#(\d+):\s*(\S+)\s*[—–-]\s*(.+)/;

  let current: Partial<ReviewFinding> | null = null;
  let currentField: string | null = null;
  let inCodeBlock = false;
  let codeLanguage = '';
  let codeLines: string[] = [];
  let inFindingsSection = false;

  function finalizeCurrent() {
    if (current && typeof current.number === 'number') {
      findings.push({
        number: current.number,
        ruleId: current.ruleId ?? '',
        severity: current.severity ?? 'MEDIUM',
        location: current.location ?? '',
        summary: current.summary ?? '',
        fix: (current.fix ?? '').trim(),
        why: (current.why ?? '').trim(),
        gain: (current.gain ?? '').trim(),
        codeBlocks: current.codeBlocks ?? [],
        status: 'unfixed',
      });
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track whether we're in the ### Findings section
    if (!inCodeBlock && line.trim() === '### Findings') {
      inFindingsSection = true;
      continue;
    }
    // Exit findings section when we hit another ### heading
    if (!inCodeBlock && inFindingsSection && /^###\s/.test(line) && line.trim() !== '### Findings') {
      finalizeCurrent();
      inFindingsSection = false;
      break;
    }
    // Only look for block findings within ### Findings section
    if (!inFindingsSection) continue;

    // Handle fenced code blocks
    if (inCodeBlock) {
      if (line.startsWith('```')) {
        if (current) {
          if (!current.codeBlocks) current.codeBlocks = [];
          current.codeBlocks.push({ label: '', language: codeLanguage, code: codeLines.join('\n') });
        }
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
      continue;
    }

    // New finding heading
    const headingMatch = line.match(FINDING_HEADING);
    if (headingMatch) {
      finalizeCurrent();
      current = {
        number: parseInt(headingMatch[1], 10),
        ruleId: headingMatch[2],
        summary: headingMatch[3].trim(),
        codeBlocks: [],
        why: '',
        gain: '',
        fix: '',
      };
      currentField = null;
      continue;
    }

    if (!current) continue;

    // Field extraction from **Key**: Value lines
    const severityMatch = line.match(/^\*\*Severity\*\*:\s*(.+)/);
    if (severityMatch) {
      current.severity = severityMatch[1].trim() as FindingSeverity;
      currentField = null;
      continue;
    }

    const locationMatch = line.match(/^\*\*Location\*\*:\s*(.+)/);
    if (locationMatch) {
      current.location = locationMatch[1].trim();
      currentField = null;
      continue;
    }

    const ruleMatch = line.match(/^\*\*Rule\*\*:\s*(.+)/);
    if (ruleMatch) {
      current.ruleId = ruleMatch[1].trim();
      currentField = null;
      continue;
    }

    const whyMatch = line.match(/^\*\*Why this severity\*\*:\s*(.+)/);
    if (whyMatch) {
      current.why = whyMatch[1].trim();
      currentField = 'why';
      continue;
    }

    const gainMatch = line.match(/^\*\*What you gain\*\*:\s*(.+)/);
    if (gainMatch) {
      current.gain = gainMatch[1].trim();
      currentField = 'gain';
      continue;
    }

    // Continuation lines for current field — preserve markdown formatting
    if (currentField && !line.startsWith('**') && !line.startsWith('#')) {
      if (line.trim()) {
        if (currentField === 'why') {
          current.why = (current.why ?? '') + '\n' + line;
        } else if (currentField === 'gain') {
          current.gain = (current.gain ?? '') + '\n' + line;
        }
      } else {
        // Empty line: add paragraph break but don't reset field
        if (currentField === 'why' && current.why) {
          current.why += '\n';
        } else if (currentField === 'gain' && current.gain) {
          current.gain += '\n';
        }
      }
    }

    // Reset field context on next field header or heading
    if (!line.trim() && !currentField) {
      currentField = null;
    }
  }

  finalizeCurrent();
  return findings;
}

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
