/**
 * Repo map module — structural codebase indexing for the context engine.
 *
 * Architecture: pluggable extractors behind a common interface.
 * - Current: TypeScript Compiler API (ts-extractor) — zero extra dependencies
 * - Future: tree-sitter (via web-tree-sitter or native bindings) for multi-language support
 */

export { typescriptExtractor } from './ts-extractor.js';
export { getAllExtractors } from './extractors.js';
export { formatRepoMap, buildRepoMap } from './format.js';
export { generateRepoMap, updateRepoMapFiles, getMapPath, isMapValid } from './generator.js';
export type { Extractor, FileExtraction, ExtractedIdentifier, ImportEntry, RepoMap, RepoMapMetadata } from './types.js';
