/**
 * Tree-sitter extractor — parses source files using web-tree-sitter WASM grammars
 * and extracts structural identifiers via S-expression queries.
 */

import { Parser, Language, Query, type Node } from 'web-tree-sitter';
import crypto from 'crypto';
import path from 'path';
import { normalizePath } from '../../utils/paths.js';
import type { Extractor, FileExtraction, ExtractedIdentifier, ImportEntry } from '../types.js';
import type { LanguageConfig, VisibilityStrategy } from './languages.js';
import type { LanguageQueries } from './queries.js';

let initialized = false;

/** Initialize the web-tree-sitter WASM runtime. Call once before loading any grammar. */
export async function initTreeSitter(): Promise<void> {
  if (initialized) return;
  // 0.25.x uses tree-sitter.wasm, 0.26+ uses web-tree-sitter.wasm
  const wasmPath = require.resolve('web-tree-sitter/tree-sitter.wasm');
  await Parser.init({
    locateFile: () => wasmPath,
  });
  initialized = true;
}

/** Load a language grammar from the tree-sitter-wasms package. */
export async function loadLanguage(config: LanguageConfig): Promise<Language> {
  const wasmPath = require.resolve(`tree-sitter-wasms/out/${config.grammarFile}`);
  return Language.load(wasmPath);
}

/** Extract the signature from a definition node (everything before the body). */
function extractSignature(node: Node, content: string): string {
  // Find the body/block child node
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (!child) continue;
    const t = child.type;
    if (
      t === 'block' || t === 'body' || t === 'class_body' ||
      t === 'function_body' || t === 'compound_statement' ||
      t === 'declaration_list' || t === 'field_declaration_list' ||
      t === 'enum_body' || t === 'interface_body' ||
      t === 'struct_body' || t === 'trait_body' || t === 'impl_body' ||
      t === 'do_block' || t === 'method_body'
    ) {
      const sig = content.slice(node.startIndex, child.startIndex).trim();
      return sig.length > 150 ? sig.slice(0, 147) + '...' : sig;
    }
  }
  // Fallback: first line of the node
  const text = node.text;
  const firstLine = text.split('\n')[0];
  return firstLine.length > 150 ? firstLine.slice(0, 147) + '...' : firstLine;
}

/** Determine the kind of a definition node. */
function inferKind(nodeType: string): string {
  if (/function|method|constructor|fn_proto/i.test(nodeType)) return 'function';
  if (/class|struct|contract|library|object_d/i.test(nodeType)) return 'class';
  if (/interface|protocol|trait/i.test(nodeType)) return 'interface';
  if (/enum/i.test(nodeType)) return 'enum';
  if (/type|module|namespace|impl/i.test(nodeType)) return 'type';
  if (/val_def|var_decl|let_decl|assignment/i.test(nodeType)) return 'variable';
  return 'variable';
}

/** Check if a node has method-like context (parent is a class body). */
function isMethod(defNode: Node): string | undefined {
  let parent = defNode.parent;
  while (parent) {
    const t = parent.type;
    if (
      t === 'class_declaration' || t === 'class_definition' ||
      t === 'class_specifier' || t === 'class_body' ||
      t === 'interface_declaration' || t === 'interface_body' ||
      t === 'impl_item' || t === 'trait_item' ||
      t === 'class_interface' || t === 'class_implementation' ||
      t === 'contract_declaration' || t === 'object_definition' ||
      t === 'trait_definition'
    ) {
      // Find the class name from this parent or its parent
      const classNode = t.endsWith('_body') ? parent.parent : parent;
      if (classNode) {
        const nameChild = classNode.childForFieldName('name');
        if (nameChild) return nameChild.text;
      }
      return undefined;
    }
    parent = parent.parent;
  }
  return undefined;
}

/** Determine if an identifier is "exported" according to the language's visibility strategy. */
function isExported(
  strategy: VisibilityStrategy,
  name: string,
  defNode: Node,
  content: string,
): boolean {
  switch (strategy) {
    case 'all-top-level':
      return true;

    case 'capitalization':
      // Go: uppercase first letter = exported
      return name.length > 0 && name[0] === name[0].toUpperCase() && name[0] !== name[0].toLowerCase();

    case 'keyword-public': {
      // Walk up to find modifiers containing 'public'
      const nodeText = content.slice(defNode.startIndex, defNode.startIndex + 200);
      // Check for explicit 'public' or 'internal' or 'private'/'protected'
      if (/\bprivate\b/.test(nodeText.split('{')[0])) return false;
      if (/\bprotected\b/.test(nodeText.split('{')[0])) return false;
      // In many languages, no modifier = package-private, but for map purposes we include it
      return true;
    }

    case 'keyword-pub': {
      // Rust: check if 'pub' keyword is present
      const nodeText = content.slice(defNode.startIndex, defNode.startIndex + 100);
      return /^\s*pub\b/.test(nodeText);
    }

    case 'none':
      return false;

    default:
      return true;
  }
}

/**
 * Create a tree-sitter extractor for a specific language.
 * The returned Extractor has a synchronous extract() method.
 */
export function createTreeSitterExtractor(
  config: LanguageConfig,
  language: Language,
  queries: LanguageQueries,
): Extractor {
  let parser = new Parser();
  parser.setLanguage(language);

  // Pre-compile queries — may throw if the query syntax is invalid for this grammar
  let defQuery: Query;
  let impQuery: Query;
  try {
    defQuery = new Query(language, queries.definitions);
  } catch (err) {
    console.warn(`[repomap] invalid definition query for ${config.id}:`, err);
    throw err;
  }
  try {
    impQuery = new Query(language, queries.imports);
  } catch (err) {
    console.warn(`[repomap] invalid import query for ${config.id}:`, err);
    throw err;
  }

  /** Recreate the parser after a WASM crash to avoid corrupted state. */
  function resetParser(): void {
    try { parser.delete(); } catch { /* already dead */ }
    parser = new Parser();
    parser.setLanguage(language);
  }

  return {
    extensions: config.extensions,

    extract(filePath: string, content: string, repoRoot: string): FileExtraction {
      const relativePath = normalizePath(path.relative(repoRoot, filePath));
      const hash = crypto.createHash('sha256').update(content).digest('hex');

      let tree;
      try {
        tree = parser.parse(content);
      } catch (err: unknown) {
        // WASM RuntimeError corrupts the parser — recreate it so subsequent files still work
        console.error(`[repomap] WASM crash parsing ${relativePath} (${config.id}), resetting parser:`, err);
        resetParser();
        return { path: relativePath, hash, identifiers: [], imports: [] };
      }
      if (!tree) {
        return { path: relativePath, hash, identifiers: [], imports: [] };
      }

      const identifiers: ExtractedIdentifier[] = [];
      const imports: ImportEntry[] = [];

      // Extract definitions
      const defMatches = defQuery.matches(tree.rootNode);
      for (const match of defMatches) {
        let nameText: string | undefined;
        let defNode: Node | undefined;

        for (const capture of match.captures) {
          if (capture.name === 'name' && !nameText) {
            nameText = capture.node.text;
          }
          if (capture.name === 'definition') {
            defNode = capture.node;
          }
        }

        if (!nameText || !defNode) continue;

        const parentClass = isMethod(defNode);
        const rawKind = inferKind(defNode.type);
        const kind = parentClass && rawKind === 'function' ? 'method' : rawKind;
        const exported = isExported(config.visibility, nameText, defNode, content);
        const signature = extractSignature(defNode, content);

        identifiers.push({
          kind,
          name: nameText,
          signature,
          exported,
          parent: parentClass,
        });
      }

      // Extract imports
      const impMatches = impQuery.matches(tree.rootNode);
      for (const match of impMatches) {
        let source: string | undefined;
        const names: string[] = [];

        for (const capture of match.captures) {
          if (capture.name === 'source') {
            // Strip quotes if present
            source = capture.node.text.replace(/^["']|["']$/g, '');
          }
          if (capture.name === 'name') {
            names.push(capture.node.text);
          }
        }

        if (source) {
          imports.push({ source, names });
        }
      }

      tree.delete();

      return { path: relativePath, hash, identifiers, imports };
    },
  };
}
