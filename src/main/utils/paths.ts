/**
 * Normalize a file path by converting backslashes to forward slashes.
 * Applied at IPC boundaries so the renderer always receives consistent paths.
 */
export function normalizePath(p: string): string {
  return p.replace(/\\/g, '/');
}

/**
 * Normalize a file path for case-insensitive comparison.
 * Converts backslashes to forward slashes and lowercases the entire path.
 * Used for duplicate detection and path matching.
 */
export function normalizePathForComparison(p: string): string {
  return p.replace(/\\/g, '/').toLowerCase();
}
