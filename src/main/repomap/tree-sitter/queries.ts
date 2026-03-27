/**
 * Tree-sitter S-expression queries for structural extraction.
 *
 * Each language defines queries to find:
 * - definitions: functions, methods, classes, structs, interfaces, traits
 * - imports: import/require/use statements
 */

export interface LanguageQueries {
  definitions: string;
  imports: string;
}

const python: LanguageQueries = {
  definitions: `
    (function_definition name: (identifier) @name) @definition
    (class_definition name: (identifier) @name) @definition
  `,
  imports: `
    (import_statement name: (dotted_name) @source)
    (import_from_statement module_name: (dotted_name) @source)
  `,
};

const java: LanguageQueries = {
  definitions: `
    (class_declaration name: (identifier) @name) @definition
    (interface_declaration name: (identifier) @name) @definition
    (enum_declaration name: (identifier) @name) @definition
    (method_declaration name: (identifier) @name) @definition
    (constructor_declaration name: (identifier) @name) @definition
  `,
  imports: `
    (import_declaration (scoped_identifier) @source)
  `,
};

const go: LanguageQueries = {
  definitions: `
    (function_declaration name: (identifier) @name) @definition
    (method_declaration name: (field_identifier) @name) @definition
    (type_declaration (type_spec name: (type_identifier) @name)) @definition
  `,
  imports: `
    (import_spec path: (interpreted_string_literal) @source)
  `,
};

const rust: LanguageQueries = {
  definitions: `
    (function_item name: (identifier) @name) @definition
    (struct_item name: (type_identifier) @name) @definition
    (enum_item name: (type_identifier) @name) @definition
    (trait_item name: (type_identifier) @name) @definition
    (impl_item type: (type_identifier) @name) @definition
    (type_item name: (type_identifier) @name) @definition
  `,
  imports: `
    (use_declaration argument: (scoped_identifier) @source)
    (use_declaration argument: (use_wildcard (scoped_identifier) @source))
  `,
};

const c: LanguageQueries = {
  definitions: `
    (function_definition declarator: (function_declarator declarator: (identifier) @name)) @definition
    (struct_specifier name: (type_identifier) @name) @definition
    (enum_specifier name: (type_identifier) @name) @definition
    (type_definition declarator: (type_identifier) @name) @definition
  `,
  imports: `
    (preproc_include path: (_) @source)
  `,
};

const cpp: LanguageQueries = {
  definitions: `
    (function_definition declarator: (function_declarator declarator: (identifier) @name)) @definition
    (class_specifier name: (type_identifier) @name) @definition
    (struct_specifier name: (type_identifier) @name) @definition
    (enum_specifier name: (type_identifier) @name) @definition
    (namespace_definition name: (namespace_identifier) @name) @definition
  `,
  imports: `
    (preproc_include path: (_) @source)
  `,
};

const csharp: LanguageQueries = {
  definitions: `
    (class_declaration name: (identifier) @name) @definition
    (interface_declaration name: (identifier) @name) @definition
    (struct_declaration name: (identifier) @name) @definition
    (enum_declaration name: (identifier) @name) @definition
    (method_declaration name: (identifier) @name) @definition
    (constructor_declaration name: (identifier) @name) @definition
  `,
  imports: `
    (using_directive (qualified_name) @source)
  `,
};

const ruby: LanguageQueries = {
  definitions: `
    (method name: (identifier) @name) @definition
    (class name: (constant) @name) @definition
    (module name: (constant) @name) @definition
    (singleton_method name: (identifier) @name) @definition
  `,
  imports: `
    (call method: (identifier) @_method arguments: (argument_list (string (string_content) @source)) (#eq? @_method "require"))
    (call method: (identifier) @_method arguments: (argument_list (string (string_content) @source)) (#eq? @_method "require_relative"))
  `,
};

const php: LanguageQueries = {
  definitions: `
    (class_declaration name: (name) @name) @definition
    (interface_declaration name: (name) @name) @definition
    (trait_declaration name: (name) @name) @definition
    (enum_declaration name: (name) @name) @definition
    (function_definition name: (name) @name) @definition
    (method_declaration name: (name) @name) @definition
  `,
  imports: `
    (namespace_use_declaration (namespace_use_clause (qualified_name) @source))
  `,
};

const kotlin: LanguageQueries = {
  definitions: `
    (class_declaration (type_identifier) @name) @definition
    (object_declaration (type_identifier) @name) @definition
    (function_declaration (simple_identifier) @name) @definition
  `,
  imports: `
    (import_header (identifier) @source)
  `,
};

const swift: LanguageQueries = {
  definitions: `
    (class_declaration (type_identifier) @name) @definition
    (protocol_declaration (type_identifier) @name) @definition
    (function_declaration (simple_identifier) @name) @definition
  `,
  imports: `
    (import_declaration (identifier) @source)
  `,
};

const scala: LanguageQueries = {
  definitions: `
    (class_definition name: (identifier) @name) @definition
    (object_definition name: (identifier) @name) @definition
    (trait_definition name: (identifier) @name) @definition
    (function_definition name: (identifier) @name) @definition
    (val_definition pattern: (identifier) @name) @definition
  `,
  imports: `
    (import_declaration path: (stable_identifier) @source)
    (import_declaration path: (identifier) @source)
  `,
};

const dart: LanguageQueries = {
  definitions: `
    (class_definition (identifier) @name) @definition
    (function_signature (identifier) @name) @definition
    (enum_declaration (identifier) @name) @definition
  `,
  imports: `
    (import_or_export (library_import (import_specification (configurable_uri (uri (string_literal) @source)))))
  `,
};

const lua: LanguageQueries = {
  definitions: `
    (function_definition_statement (identifier) @name) @definition
    (local_function_definition_statement (identifier) @name) @definition
  `,
  imports: `
    (call (variable (identifier) @_fn) (argument_list (expression_list (string) @source)) (#eq? @_fn "require"))
  `,
};

const elixir: LanguageQueries = {
  definitions: `
    (call target: (identifier) @_kind (arguments (alias) @name) (#match? @_kind "^(defmodule|defprotocol|defimpl)$")) @definition
    (call target: (identifier) @_kind (arguments (identifier) @name) (#match? @_kind "^(def|defp|defmacro|defmacrop)$")) @definition
    (call target: (identifier) @_kind (arguments (call target: (identifier) @name)) (#match? @_kind "^(def|defp|defmacro|defmacrop)$")) @definition
  `,
  imports: `
    (call target: (identifier) @_kind (arguments (alias) @source) (#match? @_kind "^(import|alias|use)$"))
  `,
};

const zig: LanguageQueries = {
  definitions: `
    (function_declaration (identifier) @name) @definition
    (variable_declaration (identifier) @name) @definition
  `,
  imports: `
    (variable_declaration (identifier) (builtin_function (builtin_identifier) @_fn (arguments (string) @source)) (#eq? @_fn "@import"))
  `,
};

const bash: LanguageQueries = {
  definitions: `
    (function_definition name: (word) @name) @definition
  `,
  imports: `
    (command name: (command_name (word) @_cmd) argument: (word) @source (#match? @_cmd "^(source|\\.)$"))
  `,
};

const ocaml: LanguageQueries = {
  definitions: `
    (value_definition (let_binding pattern: (value_name) @name)) @definition
    (type_definition (type_binding name: (type_constructor) @name)) @definition
    (module_definition (module_binding name: (module_name) @name)) @definition
  `,
  imports: `
    (open_module (module_path (module_name) @source))
  `,
};

const objc: LanguageQueries = {
  definitions: `
    (class_interface (identifier) @name) @definition
    (class_implementation (identifier) @name) @definition
    (protocol_declaration (identifier) @name) @definition
    (method_declaration (identifier) @name) @definition
  `,
  imports: `
    (preproc_include path: (_) @source)
  `,
};

const solidity: LanguageQueries = {
  definitions: `
    (contract_declaration name: (identifier) @name) @definition
    (interface_declaration name: (identifier) @name) @definition
    (library_declaration name: (identifier) @name) @definition
    (function_definition name: (identifier) @name) @definition
    (struct_declaration name: (identifier) @name) @definition
    (enum_declaration name: (identifier) @name) @definition
    (event_definition name: (identifier) @name) @definition
  `,
  imports: `
    (import_directive source: (string) @source)
  `,
};

const rescript: LanguageQueries = {
  definitions: `
    (let_declaration (let_binding (value_identifier) @name)) @definition
    (type_declaration (type_binding (type_identifier) @name)) @definition
    (module_declaration (module_binding (module_identifier) @name)) @definition
  `,
  imports: `
    (open_statement (module_identifier) @source)
  `,
};

/** Query registry — maps language ID to its tree-sitter queries. */
export const QUERY_REGISTRY = new Map<string, LanguageQueries>([
  ['python', python],
  ['java', java],
  ['go', go],
  ['rust', rust],
  ['c', c],
  ['cpp', cpp],
  ['csharp', csharp],
  ['ruby', ruby],
  ['php', php],
  ['kotlin', kotlin],
  ['swift', swift],
  ['scala', scala],
  ['dart', dart],
  ['lua', lua],
  ['elixir', elixir],
  ['zig', zig],
  ['bash', bash],
  ['ocaml', ocaml],
  ['objc', objc],
  ['solidity', solidity],
  ['rescript', rescript],
]);
