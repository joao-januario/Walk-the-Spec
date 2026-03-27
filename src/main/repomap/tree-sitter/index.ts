/**
 * Tree-sitter multi-language extraction — public API.
 *
 * Initializes web-tree-sitter once, then loads only the grammars for
 * languages whose file extensions are present in the current project.
 * This avoids loading all 16+ WASM grammars when only 1-2 are needed.
 */

import type { Extractor } from '../types.js';

/**
 * Get tree-sitter extractors filtered by the extensions actually present
 * in the project being scanned. If no filter is provided, loads all
 * extractable languages (backward compat for tests).
 *
 * Grammars are loaded per-invocation — not cached globally — so that new
 * languages added mid-development are picked up on the next generation.
 * The web-tree-sitter WASM runtime itself is initialized once.
 */
export async function getTreeSitterExtractors(extensionFilter?: Set<string>): Promise<Extractor[]> {
  const { initTreeSitter, loadLanguage, createTreeSitterExtractor } = await import('./extractor.js');
  const { EXTRACTABLE_LANGUAGES } = await import('./languages.js');
  const { QUERY_REGISTRY } = await import('./queries.js');

  await initTreeSitter();

  const extractors: Extractor[] = [];

  for (const config of EXTRACTABLE_LANGUAGES) {
    // Skip languages whose extensions aren't present in the project
    if (extensionFilter) {
      const hasMatchingExtension = config.extensions.some((ext) => extensionFilter.has(ext));
      if (!hasMatchingExtension) continue;
    }

    const queries = QUERY_REGISTRY.get(config.id);
    if (!queries) continue;

    try {
      const language = await loadLanguage(config);
      const extractor = createTreeSitterExtractor(config, language, queries);
      extractors.push(extractor);
    } catch (err) {
      console.warn(`[repomap] skipping ${config.id}: failed to load grammar or compile queries:`, err);
    }
  }

  console.log(`[repomap] tree-sitter: ${extractors.length} language extractor(s) loaded${extensionFilter ? ` (filtered from ${extensionFilter.size} extensions)` : ' (all)'}`);
  return extractors;
}

export { ALL_EXTENSIONS, EXTENSION_TO_LANGUAGE, EXTRACTABLE_LANGUAGES, LANGUAGE_CONFIGS } from './languages.js';
export { QUERY_REGISTRY } from './queries.js';
