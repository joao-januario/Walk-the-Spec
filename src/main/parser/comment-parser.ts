export interface ParsedComment {
  id: string;
  elementId: string;
  content: string;
  createdAt: string;
}

const COMMENT_LINE = /^- \[(.+?)\] \{id:(.+?)\} (.+)$/;

export function parseComments(fileContent: string): ParsedComment[] {
  if (!fileContent.trim()) return [];

  const comments: ParsedComment[] = [];
  let currentElementId: string | null = null;

  for (const line of fileContent.split('\n')) {
    const trimmed = line.trim();

    // H2 = element ID
    if (trimmed.startsWith('## ')) {
      currentElementId = trimmed.slice(3).trim();
      continue;
    }

    // Bullet = comment
    if (currentElementId) {
      const match = trimmed.match(COMMENT_LINE);
      if (match) {
        comments.push({
          id: match[2],
          elementId: currentElementId,
          createdAt: match[1],
          content: match[3],
        });
      }
    }
  }

  return comments;
}
