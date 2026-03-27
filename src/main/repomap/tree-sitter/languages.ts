/**
 * Language registry — maps file extensions to tree-sitter grammar files
 * and visibility strategies for all 36 grammars in tree-sitter-wasms.
 */

export type VisibilityStrategy =
  | 'keyword-public'   // Java, C#, PHP, Kotlin, Dart, Swift, Scala
  | 'keyword-pub'      // Rust
  | 'capitalization'   // Go (uppercase first letter = exported)
  | 'all-top-level'    // Python, C, C++, Ruby, Lua, Elixir, Zig, Bash, etc.
  | 'none';            // Markup/data languages — no identifier extraction

export interface LanguageConfig {
  id: string;
  grammarFile: string;
  extensions: string[];
  visibility: VisibilityStrategy;
}

export const LANGUAGE_CONFIGS: LanguageConfig[] = [
  // --- Programming languages (full extraction) ---
  { id: 'python',     grammarFile: 'tree-sitter-python.wasm',     extensions: ['.py', '.pyw'],                          visibility: 'all-top-level' },
  { id: 'java',       grammarFile: 'tree-sitter-java.wasm',       extensions: ['.java'],                                visibility: 'keyword-public' },
  { id: 'go',         grammarFile: 'tree-sitter-go.wasm',         extensions: ['.go'],                                  visibility: 'capitalization' },
  { id: 'rust',       grammarFile: 'tree-sitter-rust.wasm',       extensions: ['.rs'],                                  visibility: 'keyword-pub' },
  { id: 'c',          grammarFile: 'tree-sitter-c.wasm',          extensions: ['.c', '.h'],                             visibility: 'all-top-level' },
  { id: 'cpp',        grammarFile: 'tree-sitter-cpp.wasm',        extensions: ['.cpp', '.hpp', '.cc', '.hh', '.cxx'],   visibility: 'all-top-level' },
  { id: 'csharp',     grammarFile: 'tree-sitter-c_sharp.wasm',    extensions: ['.cs'],                                  visibility: 'keyword-public' },
  { id: 'ruby',       grammarFile: 'tree-sitter-ruby.wasm',       extensions: ['.rb'],                                  visibility: 'all-top-level' },
  { id: 'php',        grammarFile: 'tree-sitter-php.wasm',        extensions: ['.php'],                                 visibility: 'keyword-public' },
  { id: 'kotlin',     grammarFile: 'tree-sitter-kotlin.wasm',     extensions: ['.kt', '.kts'],                          visibility: 'all-top-level' },
  { id: 'swift',      grammarFile: 'tree-sitter-swift.wasm',      extensions: ['.swift'],                               visibility: 'keyword-public' },
  { id: 'scala',      grammarFile: 'tree-sitter-scala.wasm',      extensions: ['.scala', '.sc'],                        visibility: 'all-top-level' },
  { id: 'dart',       grammarFile: 'tree-sitter-dart.wasm',       extensions: ['.dart'],                                visibility: 'all-top-level' },
  { id: 'lua',        grammarFile: 'tree-sitter-lua.wasm',        extensions: ['.lua'],                                 visibility: 'all-top-level' },
  { id: 'elixir',     grammarFile: 'tree-sitter-elixir.wasm',     extensions: ['.ex', '.exs'],                          visibility: 'all-top-level' },
  // Zig disabled — tree-sitter-zig.wasm crashes with WASM RuntimeError in Electron (works in Node/Vitest but not in production)
  // { id: 'zig',        grammarFile: 'tree-sitter-zig.wasm',        extensions: ['.zig'],                                 visibility: 'keyword-pub' },
  // Bash disabled — tree-sitter-bash.wasm crashes with TypeError in Electron WASM (works in Node/Vitest but not in production)
  // { id: 'bash',       grammarFile: 'tree-sitter-bash.wasm',       extensions: ['.sh', '.bash'],                         visibility: 'all-top-level' },
  { id: 'ocaml',      grammarFile: 'tree-sitter-ocaml.wasm',      extensions: ['.ml', '.mli'],                          visibility: 'all-top-level' },
  { id: 'elm',        grammarFile: 'tree-sitter-elm.wasm',        extensions: ['.elm'],                                 visibility: 'none' },
  { id: 'objc',       grammarFile: 'tree-sitter-objc.wasm',       extensions: ['.m'],                                   visibility: 'all-top-level' },
  { id: 'solidity',   grammarFile: 'tree-sitter-solidity.wasm',   extensions: ['.sol'],                                 visibility: 'all-top-level' },
  { id: 'rescript',   grammarFile: 'tree-sitter-rescript.wasm',   extensions: ['.res', '.resi'],                        visibility: 'all-top-level' },

  // --- Markup / data (no identifier extraction) ---
  { id: 'css',        grammarFile: 'tree-sitter-css.wasm',        extensions: ['.css'],                                 visibility: 'none' },
  { id: 'html',       grammarFile: 'tree-sitter-html.wasm',       extensions: ['.html', '.htm'],                        visibility: 'none' },
  { id: 'json',       grammarFile: 'tree-sitter-json.wasm',       extensions: ['.json'],                                visibility: 'none' },
  { id: 'yaml',       grammarFile: 'tree-sitter-yaml.wasm',       extensions: ['.yml', '.yaml'],                        visibility: 'none' },
  { id: 'toml',       grammarFile: 'tree-sitter-toml.wasm',       extensions: ['.toml'],                                visibility: 'none' },
  { id: 'vue',        grammarFile: 'tree-sitter-vue.wasm',        extensions: ['.vue'],                                 visibility: 'none' },
  { id: 'elisp',      grammarFile: 'tree-sitter-elisp.wasm',      extensions: ['.el'],                                  visibility: 'none' },
  { id: 'ql',         grammarFile: 'tree-sitter-ql.wasm',         extensions: ['.ql'],                                  visibility: 'none' },
  { id: 'tlaplus',    grammarFile: 'tree-sitter-tlaplus.wasm',    extensions: ['.tla'],                                 visibility: 'none' },
  { id: 'systemrdl',  grammarFile: 'tree-sitter-systemrdl.wasm',  extensions: ['.rdl'],                                 visibility: 'none' },
];

/** Set of all file extensions handled by tree-sitter extractors. */
export const ALL_EXTENSIONS = new Set(
  LANGUAGE_CONFIGS.flatMap((c) => c.extensions),
);

/** Lookup: extension → LanguageConfig */
export const EXTENSION_TO_LANGUAGE = new Map<string, LanguageConfig>();
for (const lang of LANGUAGE_CONFIGS) {
  for (const ext of lang.extensions) {
    EXTENSION_TO_LANGUAGE.set(ext, lang);
  }
}

/** Only languages with actual identifier extraction (visibility !== 'none'). */
export const EXTRACTABLE_LANGUAGES = LANGUAGE_CONFIGS.filter(
  (c) => c.visibility !== 'none',
);
