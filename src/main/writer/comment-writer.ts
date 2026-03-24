import fs from 'fs';
import path from 'path';

function formatLine(timestamp: string, id: string, content: string): string {
  return `- [${timestamp}] {id:${id}} ${content}`;
}

export function writeComment(
  filePath: string,
  artifactName: string,
  elementId: string,
  commentId: string,
  content: string,
  timestamp: string,
): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  if (!fs.existsSync(filePath)) {
    // Create new file
    const lines = [
      `# Comments: ${artifactName}`,
      '',
      `## ${elementId}`,
      formatLine(timestamp, commentId, content),
      '',
    ];
    fs.writeFileSync(filePath, lines.join('\n'));
    return;
  }

  // Append to existing file
  const existing = fs.readFileSync(filePath, 'utf-8');
  const lines = existing.split('\n');

  // Find the element's H2 section
  const h2Pattern = `## ${elementId}`;
  const h2Index = lines.findIndex((l) => l.trim() === h2Pattern);

  if (h2Index !== -1) {
    // Find the end of this section (next H2 or end of file)
    let insertIndex = h2Index + 1;
    while (insertIndex < lines.length && !lines[insertIndex].startsWith('## ')) {
      insertIndex++;
    }
    // Insert before the next section (or end), after the last bullet
    let lastBullet = h2Index;
    for (let i = h2Index + 1; i < insertIndex; i++) {
      if (lines[i].startsWith('- ')) lastBullet = i;
    }
    lines.splice(lastBullet + 1, 0, formatLine(timestamp, commentId, content));
  } else {
    // Add new section at end
    // Ensure trailing newline
    if (lines[lines.length - 1]?.trim() !== '') lines.push('');
    lines.push(`## ${elementId}`);
    lines.push(formatLine(timestamp, commentId, content));
    lines.push('');
  }

  fs.writeFileSync(filePath, lines.join('\n'));
}

export function updateComment(filePath: string, commentId: string, newContent: string, timestamp: string): void {
  if (!fs.existsSync(filePath)) throw new Error(`Comment file not found: ${filePath}`);

  const existing = fs.readFileSync(filePath, 'utf-8');
  const idPattern = `{id:${commentId}}`;

  const lines = existing.split('\n').map((line) => {
    if (line.includes(idPattern)) {
      // Preserve element context, replace content
      return formatLine(timestamp, commentId, newContent);
    }
    return line;
  });

  fs.writeFileSync(filePath, lines.join('\n'));
}

export function deleteComment(filePath: string, commentId: string): void {
  if (!fs.existsSync(filePath)) throw new Error(`Comment file not found: ${filePath}`);

  const existing = fs.readFileSync(filePath, 'utf-8');
  const idPattern = `{id:${commentId}}`;

  const lines = existing.split('\n').filter((line) => !line.includes(idPattern));
  fs.writeFileSync(filePath, lines.join('\n'));
}
