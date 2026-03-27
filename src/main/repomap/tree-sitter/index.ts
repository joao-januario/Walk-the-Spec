/**
 * Tree-sitter multi-language extraction — public API.
 *
 * Initializes web-tree-sitter once, loads all available grammars from
 * tree-sitter-wasms, and returns Extractor instances for each language
 * that has both a grammar and query definitions.
 */

import { initTreeSitter, loadLanguage, createTreeSitterExtractor } from './extractor.js';
import { EXTRACTABLE_LANGUAGES } from './languages.js';
import { QUERY_REGISTRY } from './queries.js';
import type { Extractor } from '../types.js';

let cachedExtractors: Extractor[] | null = null;

/**
 * Get tree-sitter extractors for all supported languages.
 * Initializes on first call, caches thereafter. Non-fatal per language.
 */
export async function getTreeSitterExtractors(): Promise<Extractor[]> {
  if (cachedExtractors) return cachedExtractors;

  await initTreeSitter();

  const extractors: Extractor[] = [];

  for (const config of EXTRACTABLE_LANGUAGES) {
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

  cachedExtractors = extractors;
  console.log(`[repomap] tree-sitter initialized: ${extractors.length} language extractors ready`);
  return extractors;
}

export { ALL_EXTENSIONS, EXTENSION_TO_LANGUAGE, EXTRACTABLE_LANGUAGES, LANGUAGE_CONFIGS } from './languages.js';
export { QUERY_REGISTRY } from './queries.js';
