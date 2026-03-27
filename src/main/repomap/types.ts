/**
 * Types for the structural map extraction system.
 *
 * The extractor interface is pluggable: the initial implementation uses the
 * TypeScript Compiler API; tree-sitter can be swapped in by implementing
 * the same Extractor interface.
 */

/** A single exported/public identifier extracted from a source file. */
export interface ExtractedIdentifier {
  kind: 'function' | 'class' | 'interface' | 'type' | 'enum' | 'variable' | 'method';
  /** Identifier name (e.g. "parseSpec") */
  name: string;
  /** Signature text without body (e.g. "function parseSpec(content: string): ParsedSpec") */
  signature: string;
  /** Whether this identifier is exported */
  exported: boolean;
  /** Parent name for nested identifiers (methods inside a class) */
  parent?: string;
}

/** Extraction result for a single source file. */
export interface FileExtraction {
  /** Relative path from repo root */
  path: string;
  /** SHA-256 hex digest of the file content at extraction time */
  hash: string;
  /** Extracted public identifiers */
  identifiers: ExtractedIdentifier[];
  /** Module imports: what this file imports and from where */
  imports: ImportEntry[];
}

/** A single import statement. */
export interface ImportEntry {
  /** Module specifier (e.g. "./utils/paths.js", "chokidar") */
  source: string;
  /** Imported names (empty for namespace/default imports) */
  names: string[];
}

/** The pluggable extractor interface — implement this for each language. */
export interface Extractor {
  /** File extensions this extractor handles (e.g. ['.ts', '.tsx']) */
  extensions: string[];
  /**
   * Extract structural information from a source file.
   * @param filePath Absolute path to the source file
   * @param content File content as a string
   * @param repoRoot Absolute path to the repository root
   * @returns Extraction result with identifiers and imports
   */
  extract(filePath: string, content: string, repoRoot: string): FileExtraction;
}

/** Metadata header for the generated repo map. */
export interface RepoMapMetadata {
  generatedAt: string;
  updatedAt: string;
  fileCount: number;
  tokenEstimate: number;
}

/** A file that failed extraction. */
export interface ExtractionFailure {
  path: string;
  error: string;
}

/** Complete repo map: metadata + file entries + failures. */
export interface RepoMap {
  metadata: RepoMapMetadata;
  files: FileExtraction[];
  failures: ExtractionFailure[];
}
