export interface RefactorEntry {
  id: string;
  branch: string;
  rule: string;
  files: string;
  description: string;
  status: string;
}

export interface RefactorBacklogResult {
  entries: RefactorEntry[];
}

const TABLE_ROW = /^\|\s*(\S+)\s*\|\s*(\S+)\s*\|\s*(\S+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(\S+)\s*\|$/;

export function parseRefactorBacklog(content: string): RefactorBacklogResult {
  if (!content.trim()) return { entries: [] };

  const entries: RefactorEntry[] = [];

  for (const rawLine of content.split('\n')) {
    const line = rawLine.replace(/\r$/, '');
    const match = line.match(TABLE_ROW);
    if (match && match[1] !== 'ID' && !match[1].startsWith('-')) {
      entries.push({
        id: match[1],
        branch: match[2],
        rule: match[3],
        files: match[4].trim(),
        description: match[5].trim(),
        status: match[6],
      });
    }
  }

  return { entries };
}
