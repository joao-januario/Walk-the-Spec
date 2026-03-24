/**
 * Positional string splicing for markdown editing.
 * Replaces a byte range in the original content with new text,
 * preserving everything outside the range.
 */
export function spliceAtPosition(original: string, startOffset: number, endOffset: number, replacement: string): string {
  return original.slice(0, startOffset) + replacement + original.slice(endOffset);
}
