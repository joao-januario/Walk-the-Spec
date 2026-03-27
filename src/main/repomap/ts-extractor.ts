/**
 * TypeScript Compiler API extractor.
 *
 * Uses ts.createSourceFile() to parse TypeScript/JavaScript files and extract
 * public surface: exported functions, classes, interfaces, types, enums, and
 * top-level variables. No type-checking — single-file AST parse only.
 */

import ts from 'typescript';
import crypto from 'crypto';
import path from 'path';
import { normalizePath } from '../utils/paths.js';
import type { Extractor, FileExtraction, ExtractedIdentifier, ImportEntry } from './types.js';

function hasExportModifier(node: ts.Node): boolean {
  const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
  return modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;
}

function isDefaultExport(node: ts.Node): boolean {
  const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
  return modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword) ?? false;
}

function formatParameters(params: ts.NodeArray<ts.ParameterDeclaration>, sourceFile: ts.SourceFile): string {
  return params
    .map((p) => p.getText(sourceFile))
    .join(', ');
}

function formatReturnType(node: ts.FunctionDeclaration | ts.MethodDeclaration | ts.ArrowFunction, sourceFile: ts.SourceFile): string {
  if (node.type) return `: ${node.type.getText(sourceFile)}`;
  return '';
}

function extractIdentifiers(sourceFile: ts.SourceFile): ExtractedIdentifier[] {
  const identifiers: ExtractedIdentifier[] = [];

  function visit(node: ts.Node, parent?: string) {
    // Export declarations: export { foo, bar } or export { foo } from './mod'
    if (ts.isExportDeclaration(node)) {
      const clause = node.exportClause;
      if (clause && ts.isNamedExports(clause)) {
        for (const spec of clause.elements) {
          identifiers.push({
            kind: 'variable',
            name: spec.name.text,
            signature: `export { ${spec.name.text} }`,
            exported: true,
          });
        }
      }
      return;
    }

    // Export assignment: export default expr
    if (ts.isExportAssignment(node)) {
      const expr = node.expression;
      const name = ts.isIdentifier(expr) ? expr.text : 'default';
      identifiers.push({
        kind: 'variable',
        name,
        signature: `export default ${name}`,
        exported: true,
      });
      return;
    }

    // Function declarations (only exported — non-exported are implementation details)
    if (ts.isFunctionDeclaration(node) && node.name) {
      const exported = hasExportModifier(node);
      if (!exported) return; // Skip non-exported functions
      const def = isDefaultExport(node);
      const params = formatParameters(node.parameters, sourceFile);
      const ret = formatReturnType(node, sourceFile);
      const prefix = def ? 'export default ' : 'export ';
      const asyncMod = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword) ? 'async ' : '';
      identifiers.push({
        kind: 'function',
        name: node.name.text,
        signature: `${prefix}${asyncMod}function ${node.name.text}(${params})${ret}`,
        exported,
        parent,
      });
      return;
    }

    // Class declarations (only exported)
    if (ts.isClassDeclaration(node) && node.name) {
      const exported = hasExportModifier(node);
      if (!exported) return; // Skip non-exported classes
      const className = node.name.text;
      identifiers.push({
        kind: 'class',
        name: className,
        signature: `export class ${className}`,
        exported,
        parent,
      });
      // Extract methods (always included for exported classes)
      for (const member of node.members) {
        if (ts.isMethodDeclaration(member) && member.name && ts.isIdentifier(member.name)) {
          const params = formatParameters(member.parameters, sourceFile);
          const ret = formatReturnType(member, sourceFile);
          const isStatic = member.modifiers?.some((m) => m.kind === ts.SyntaxKind.StaticKeyword) ? 'static ' : '';
          const asyncMod = member.modifiers?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword) ? 'async ' : '';
          identifiers.push({
            kind: 'method',
            name: member.name.text,
            signature: `${isStatic}${asyncMod}${member.name.text}(${params})${ret}`,
            exported: false,
            parent: className,
          });
        }
      }
      return;
    }

    // Interface declarations (only exported)
    if (ts.isInterfaceDeclaration(node)) {
      const exported = hasExportModifier(node);
      if (!exported) return;
      identifiers.push({
        kind: 'interface',
        name: node.name.text,
        signature: 'export interface ' + node.name.text,
        exported,
        parent,
      });
      return;
    }

    // Type alias declarations (only exported)
    if (ts.isTypeAliasDeclaration(node)) {
      const exported = hasExportModifier(node);
      if (!exported) return;
      identifiers.push({
        kind: 'type',
        name: node.name.text,
        signature: 'export type ' + node.name.text,
        exported,
        parent,
      });
      return;
    }

    // Enum declarations (only exported)
    if (ts.isEnumDeclaration(node)) {
      const exported = hasExportModifier(node);
      if (!exported) return;
      identifiers.push({
        kind: 'enum',
        name: node.name.text,
        signature: 'export enum ' + node.name.text,
        exported,
        parent,
      });
      return;
    }

    // Variable statements (const/let/var)
    if (ts.isVariableStatement(node)) {
      const exported = hasExportModifier(node);
      if (exported) {
        const declKind = node.declarationList.flags & ts.NodeFlags.Const ? 'const' : 'let';
        for (const decl of node.declarationList.declarations) {
          if (ts.isIdentifier(decl.name)) {
            const typeAnnotation = decl.type ? `: ${decl.type.getText(sourceFile)}` : '';
            identifiers.push({
              kind: 'variable',
              name: decl.name.text,
              signature: `export ${declKind} ${decl.name.text}${typeAnnotation}`,
              exported: true,
              parent,
            });
          }
        }
      }
      return;
    }

    ts.forEachChild(node, (child) => visit(child, parent));
  }

  visit(sourceFile);
  return identifiers;
}

function extractImports(sourceFile: ts.SourceFile): ImportEntry[] {
  const imports: ImportEntry[] = [];

  for (const stmt of sourceFile.statements) {
    if (ts.isImportDeclaration(stmt) && ts.isStringLiteral(stmt.moduleSpecifier)) {
      const source = stmt.moduleSpecifier.text;
      const names: string[] = [];

      if (stmt.importClause) {
        // Default import
        if (stmt.importClause.name) {
          names.push(stmt.importClause.name.text);
        }
        // Named imports
        const bindings = stmt.importClause.namedBindings;
        if (bindings && ts.isNamedImports(bindings)) {
          for (const spec of bindings.elements) {
            names.push(spec.name.text);
          }
        }
        // Namespace import
        if (bindings && ts.isNamespaceImport(bindings)) {
          names.push(`* as ${bindings.name.text}`);
        }
      }

      imports.push({ source, names });
    }
  }

  return imports;
}

export const typescriptExtractor: Extractor = {
  extensions: ['.ts', '.tsx', '.js', '.jsx'],

  extract(filePath: string, content: string, repoRoot: string): FileExtraction {
    const relativePath = normalizePath(path.relative(repoRoot, filePath));
    const hash = crypto.createHash('sha256').update(content).digest('hex');

    const scriptKind = filePath.endsWith('.tsx') || filePath.endsWith('.jsx')
      ? ts.ScriptKind.TSX
      : ts.ScriptKind.TS;

    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true,
      scriptKind,
    );

    return {
      path: relativePath,
      hash,
      identifiers: extractIdentifiers(sourceFile),
      imports: extractImports(sourceFile),
    };
  },
};
