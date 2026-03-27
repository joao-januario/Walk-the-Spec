/**
 * Unified extractor builder — combines TypeScript compiler API extractor
 * with all available tree-sitter extractors.
 *
 * Both are lazy-loaded on first call to getAllExtractors(). The TypeScript
 * compiler and tree-sitter WASM grammars are NOT loaded at module import
 * time — they only load when repo map generation actually runs.
 *
 * TypeScript extractor is listed first so it claims .ts/.tsx/.js/.jsx
 * before any tree-sitter extractor (generator's extractorByExt uses
 * first-registered wins).
 */

import type { Extractor } from './types.js';

/** Get all available extractors: TypeScript (primary) + tree-sitter (everything else). */
export async function getAllExtractors(extensionFilter?: Set<string>): Promise<Extractor[]> {
  const { getTypescriptExtractor } = await import('./ts-extractor.js');
  const tsExtractor = await getTypescriptExtractor();

  const { getTreeSitterExtractors } = await import('./tree-sitter/index.js');
  const treeSitterExtractors = await getTreeSitterExtractors(extensionFilter);

  return [tsExtractor, ...treeSitterExtractors];
}
