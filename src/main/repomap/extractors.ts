/**
 * Unified extractor builder — combines TypeScript compiler API extractor
 * with all available tree-sitter extractors.
 *
 * TypeScript extractor is listed first so it claims .ts/.tsx/.js/.jsx
 * before any tree-sitter extractor (generator's extractorByExt uses
 * first-registered wins).
 */

import { typescriptExtractor } from './ts-extractor.js';
import { getTreeSitterExtractors } from './tree-sitter/index.js';
import type { Extractor } from './types.js';

let cached: Extractor[] | null = null;

/** Get all available extractors: TypeScript (primary) + tree-sitter (everything else). */
export async function getAllExtractors(): Promise<Extractor[]> {
  if (cached) return cached;
  const treeSitterExtractors = await getTreeSitterExtractors();
  cached = [typescriptExtractor, ...treeSitterExtractors];
  return cached;
}
