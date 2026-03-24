export type FindingSeverity = 'NEEDS_REFACTOR' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type FindingStatus = 'unfixed' | 'FIXED' | 'SKIPPED' | 'MANUAL';

export interface ReviewFinding {
  number: number;
  ruleId: string;
  severity: FindingSeverity;
  file: string;
  line: number | null;
  summary: string;
  fix: string;
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

const FINDING_ROW = /^\|\s*(\d+)\s*\|\s*(\S+)\s*\|\s*(\S+)\s*\|\s*(\S+?)(?::(\d+))?\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|$/;
const HEAL_STATUS_ROW = /^\|\s*(\d+)\s*\|\s*(\S+)\s*\|\s*(\S+)\s*\|\s*(.+?)\s*\|$/;

export function parseReview(content: string): ReviewParseResult {
  if (!content.trim()) {
    return { branch: '', findings: [], healSummary: null };
  }

  const lines = content.split('\n');
  const branch = extractBranch(lines);
  const findings = extractFindings(lines);
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
      const match = line.match(FINDING_ROW);
      if (match) {
        findings.push({
          number: parseInt(match[1], 10),
          ruleId: match[2],
          severity: match[3] as FindingSeverity,
          file: match[4],
          line: match[5] ? parseInt(match[5], 10) : null,
          summary: match[6].trim(),
          fix: match[7].trim(),
          status: 'unfixed',
        });
      }
    }
  }

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
