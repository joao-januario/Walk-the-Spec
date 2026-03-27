/**
 * Aider-style repo map formatter.
 *
 * Produces plain-text structural skeletons with:
 * - File path headers with SHA-256 content hash
 * - │-prefixed identifier lines
 * - ⋮... elision markers between sections
 * - Metadata header with generation timestamps and token estimate
 */

import type { RepoMap, FileExtraction, ExtractedIdentifier } from './types.js';

function estimateTokens(text: string): number {
  // Rough approximation: 1 token ≈ 4 characters for code
  return Math.ceil(text.length / 4);
}

function formatIdentifier(id: ExtractedIdentifier): string {
  if (id.parent) {
    return `│   ${id.signature}`;
  }
  return `│ ${id.signature}`;
}

function groupByParent(identifiers: ExtractedIdentifier[]): Map<string | undefined, ExtractedIdentifier[]> {
  const groups = new Map<string | undefined, ExtractedIdentifier[]>();
  for (const id of identifiers) {
    const key = id.parent;
    if (!groups.has(key)) groups.set(key, []);
    const group = groups.get(key);
    if (!group) throw new Error(`Unexpected missing group for key: ${key}`);
    group.push(id);
  }
  return groups;
}

function formatFileEntry(file: FileExtraction): string {
  const lines: string[] = [];

  // File header with hash
  lines.push(`${file.path}`);
  lines.push(`│ hash: ${file.hash.slice(0, 12)}`);

  // Imports (compact)
  if (file.imports.length > 0) {
    lines.push('│');
    const externalImports = file.imports.filter((i) => !i.source.startsWith('.'));
    const localImports = file.imports.filter((i) => i.source.startsWith('.'));

    if (externalImports.length > 0) {
      lines.push(`│ imports: ${externalImports.map((i) => i.source).join(', ')}`);
    }
    if (localImports.length > 0) {
      lines.push(`│ local: ${localImports.map((i) => i.source).join(', ')}`);
    }
  }

  // Identifiers grouped by parent
  const grouped = groupByParent(file.identifiers);
  const topLevel = grouped.get(undefined) ?? [];
  const classNames = new Set(
    file.identifiers.filter((id) => id.kind === 'class').map((id) => id.name),
  );

  if (topLevel.length > 0 || classNames.size > 0) {
    lines.push('│');
  }

  for (const id of topLevel) {
    lines.push(formatIdentifier(id));

    // If this is a class, inline its methods
    if (id.kind === 'class' && grouped.has(id.name)) {
      const methods = grouped.get(id.name) ?? [];
      for (const method of methods) {
        lines.push(formatIdentifier(method));
      }
      lines.push('│   ⋮...');
    }
  }

  return lines.join('\n');
}

export function formatRepoMap(map: RepoMap): string {
  const sections: string[] = [];

  // Metadata header
  sections.push('# Repo Map');
  sections.push('');
  sections.push(`Generated: ${map.metadata.generatedAt}`);
  sections.push(`Updated: ${map.metadata.updatedAt}`);
  sections.push(`Files: ${map.metadata.fileCount}`);
  sections.push(`Token estimate: ~${map.metadata.tokenEstimate}`);
  sections.push('');
  sections.push('---');
  sections.push('');

  // File entries
  for (let i = 0; i < map.files.length; i++) {
    sections.push(formatFileEntry(map.files[i]));
    if (i < map.files.length - 1) {
      sections.push('');
      sections.push('⋮...');
      sections.push('');
    }
  }

  sections.push('');

  const output = sections.join('\n');

  return output;
}

export function buildRepoMap(files: FileExtraction[], now?: string): RepoMap {
  const timestamp = now ?? new Date().toISOString();

  const map: RepoMap = {
    metadata: {
      generatedAt: timestamp,
      updatedAt: timestamp,
      fileCount: files.length,
      tokenEstimate: 0,
    },
    files,
  };

  // Calculate token estimate from formatted output
  const formatted = formatRepoMap(map);
  map.metadata.tokenEstimate = estimateTokens(formatted);

  return map;
}
