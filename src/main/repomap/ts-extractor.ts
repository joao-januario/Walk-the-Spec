/**
 * TypeScript Compiler API extractor.
 *
 * Uses ts.createSourceFile() to parse TypeScript/JavaScript files and extract
 * public surface: exported functions, classes, interfaces, types, enums, and
 * top-level variables. No type-checking — single-file AST parse only.
 *
 * The `typescript` package (~40-60MB heap) is loaded lazily on first call to
 * getTypescriptExtractor() — it won't be pulled into memory at startup.
 */

import crypto from 'crypto';
import path from 'path';
import { normalizePath } from '../utils/paths.js';
import type { Extractor, FileExtraction, ExtractedIdentifier, ImportEntry } from './types.js';

/** Lazily-loaded TypeScript module reference. */
let ts: typeof import('typescript') | null = null;

/** Load the TypeScript compiler on first use, cache for subsequent calls. */
async function getTs(): Promise<typeof import('typescript')> {
  if (ts) return ts;
  ts = (await import('typescript')).default;
  return ts;
}

function hasExportModifier(tsModule: typeof import('typescript'), node: import('typescript').Node): boolean {
  const modifiers = tsModule.canHaveModifiers(node) ? tsModule.getModifiers(node) : undefined;
  return modifiers?.some((m) => m.kind === tsModule.SyntaxKind.ExportKeyword) ?? false;
}

function isDefaultExport(tsModule: typeof import('typescript'), node: import('typescript').Node): boolean {
  const modifiers = tsModule.canHaveModifiers(node) ? tsModule.getModifiers(node) : undefined;
  return modifiers?.some((m) => m.kind === tsModule.SyntaxKind.DefaultKeyword) ?? false;
}

function formatParameters(tsModule: typeof import('typescript'), params: import('typescript').NodeArray<import('typescript').ParameterDeclaration>, sourceFile: import('typescript').SourceFile): string {
  return params
    .map((p) => p.getText(sourceFile))
    .join(', ');
}

function formatReturnType(node: import('typescript').FunctionDeclaration | import('typescript').MethodDeclaration | import('typescript').ArrowFunction, sourceFile: import('typescript').SourceFile): string {
  if (node.type) return `: ${node.type.getText(sourceFile)}`;
  return '';
}

function extractIdentifiers(tsModule: typeof import('typescript'), sourceFile: import('typescript').SourceFile): ExtractedIdentifier[] {
  const identifiers: ExtractedIdentifier[] = [];

  function visit(node: import('typescript').Node, parent?: string) {
    if (tsModule.isExportDeclaration(node)) {
      const clause = node.exportClause;
      if (clause && tsModule.isNamedExports(clause)) {
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

    if (tsModule.isExportAssignment(node)) {
      const expr = node.expression;
      const name = tsModule.isIdentifier(expr) ? expr.text : 'default';
      identifiers.push({
        kind: 'variable',
        name,
        signature: `export default ${name}`,
        exported: true,
      });
      return;
    }

    if (tsModule.isFunctionDeclaration(node) && node.name) {
      const exported = hasExportModifier(tsModule, node);
      if (!exported) return;
      const def = isDefaultExport(tsModule, node);
      const params = formatParameters(tsModule, node.parameters, sourceFile);
      const ret = formatReturnType(node, sourceFile);
      const prefix = def ? 'export default ' : 'export ';
      const asyncMod = node.modifiers?.some((m) => m.kind === tsModule.SyntaxKind.AsyncKeyword) ? 'async ' : '';
      identifiers.push({
        kind: 'function',
        name: node.name.text,
        signature: `${prefix}${asyncMod}function ${node.name.text}(${params})${ret}`,
        exported,
        parent,
      });
      return;
    }

    if (tsModule.isClassDeclaration(node) && node.name) {
      const exported = hasExportModifier(tsModule, node);
      if (!exported) return;
      const className = node.name.text;
      identifiers.push({
        kind: 'class',
        name: className,
        signature: `export class ${className}`,
        exported,
        parent,
      });
      for (const member of node.members) {
        if (tsModule.isMethodDeclaration(member) && member.name && tsModule.isIdentifier(member.name)) {
          const params = formatParameters(tsModule, member.parameters, sourceFile);
          const ret = formatReturnType(member, sourceFile);
          const isStatic = member.modifiers?.some((m) => m.kind === tsModule.SyntaxKind.StaticKeyword) ? 'static ' : '';
          const asyncMod = member.modifiers?.some((m) => m.kind === tsModule.SyntaxKind.AsyncKeyword) ? 'async ' : '';
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

    if (tsModule.isInterfaceDeclaration(node)) {
      const exported = hasExportModifier(tsModule, node);
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

    if (tsModule.isTypeAliasDeclaration(node)) {
      const exported = hasExportModifier(tsModule, node);
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

    if (tsModule.isEnumDeclaration(node)) {
      const exported = hasExportModifier(tsModule, node);
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

    if (tsModule.isVariableStatement(node)) {
      const exported = hasExportModifier(tsModule, node);
      if (exported) {
        const declKind = node.declarationList.flags & tsModule.NodeFlags.Const ? 'const' : 'let';
        for (const decl of node.declarationList.declarations) {
          if (tsModule.isIdentifier(decl.name)) {
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

    tsModule.forEachChild(node, (child) => visit(child, parent));
  }

  visit(sourceFile);
  return identifiers;
}

function extractImports(tsModule: typeof import('typescript'), sourceFile: import('typescript').SourceFile): ImportEntry[] {
  const imports: ImportEntry[] = [];

  for (const stmt of sourceFile.statements) {
    if (tsModule.isImportDeclaration(stmt) && tsModule.isStringLiteral(stmt.moduleSpecifier)) {
      const source = stmt.moduleSpecifier.text;
      const names: string[] = [];

      if (stmt.importClause) {
        if (stmt.importClause.name) {
          names.push(stmt.importClause.name.text);
        }
        const bindings = stmt.importClause.namedBindings;
        if (bindings && tsModule.isNamedImports(bindings)) {
          for (const spec of bindings.elements) {
            names.push(spec.name.text);
          }
        }
        if (bindings && tsModule.isNamespaceImport(bindings)) {
          names.push(`* as ${bindings.name.text}`);
        }
      }

      imports.push({ source, names });
    }
  }

  return imports;
}

/**
 * Get the TypeScript extractor, lazily loading the TypeScript compiler on first call.
 * Subsequent calls return instantly from cache.
 */
export async function getTypescriptExtractor(): Promise<Extractor> {
  const tsModule = await getTs();

  return {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],

    extract(filePath: string, content: string, repoRoot: string): FileExtraction {
      const relativePath = normalizePath(path.relative(repoRoot, filePath));
      const hash = crypto.createHash('sha256').update(content).digest('hex');

      const scriptKind = filePath.endsWith('.tsx') || filePath.endsWith('.jsx')
        ? tsModule.ScriptKind.TSX
        : tsModule.ScriptKind.TS;

      const sourceFile = tsModule.createSourceFile(
        filePath,
        content,
        tsModule.ScriptTarget.Latest,
        true,
        scriptKind,
      );

      return {
        path: relativePath,
        hash,
        identifiers: extractIdentifiers(tsModule, sourceFile),
        imports: extractImports(tsModule, sourceFile),
      };
    },
  };
}
