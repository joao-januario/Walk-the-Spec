import { describe, it, expect } from 'vitest';
import { formatRepoMap, buildRepoMap } from '../../../src/main/repomap/format.js';
import type { FileExtraction, RepoMap } from '../../../src/main/repomap/types.js';

const sampleFiles: FileExtraction[] = [
  {
    path: 'src/main/index.ts',
    hash: 'abc123def456abc123def456abc123def456abc123def456abc123def456abc1',
    identifiers: [
      { kind: 'function', name: 'startApp', signature: 'export async function startApp(): Promise<void>', exported: true },
      { kind: 'class', name: 'AppManager', signature: 'export class AppManager', exported: true },
      { kind: 'method', name: 'init', signature: 'async init(): Promise<void>', exported: false, parent: 'AppManager' },
      { kind: 'method', name: 'shutdown', signature: 'shutdown(): void', exported: false, parent: 'AppManager' },
    ],
    imports: [
      { source: 'electron', names: ['app', 'BrowserWindow'] },
      { source: './config.js', names: ['loadConfig'] },
    ],
  },
  {
    path: 'src/main/config.ts',
    hash: 'def456abc123def456abc123def456abc123def456abc123def456abc123def4',
    identifiers: [
      { kind: 'interface', name: 'Config', signature: 'export interface Config', exported: true },
      { kind: 'function', name: 'loadConfig', signature: 'export function loadConfig(): Config', exported: true },
    ],
    imports: [
      { source: 'fs', names: ['fs'] },
    ],
  },
];

describe('formatRepoMap', () => {
  const map = buildRepoMap(sampleFiles, '2026-03-26T00:00:00.000Z');
  const output = formatRepoMap(map);

  it('starts with # Repo Map header', () => {
    expect(output).toMatch(/^# Repo Map/);
  });

  it('includes metadata fields', () => {
    expect(output).toContain('Generated: 2026-03-26T00:00:00.000Z');
    expect(output).toContain('Updated: 2026-03-26T00:00:00.000Z');
    expect(output).toContain('Files: 2');
    expect(output).toContain('Token estimate: ~');
  });

  it('includes file paths', () => {
    expect(output).toContain('src/main/index.ts');
    expect(output).toContain('src/main/config.ts');
  });

  it('includes truncated hashes', () => {
    expect(output).toContain('│ hash: abc123def456');
    expect(output).toContain('│ hash: def456abc123');
  });

  it('includes identifiers with │ prefix', () => {
    expect(output).toContain('│ export async function startApp(): Promise<void>');
    expect(output).toContain('│ export class AppManager');
    expect(output).toContain('│ export interface Config');
  });

  it('indents methods under classes', () => {
    expect(output).toContain('│   async init(): Promise<void>');
    expect(output).toContain('│   shutdown(): void');
  });

  it('includes ⋮... elision markers between files', () => {
    expect(output).toContain('⋮...');
  });

  it('includes import information', () => {
    expect(output).toContain('│ imports: electron');
    expect(output).toContain('│ local: ./config.js');
  });

  it('separates external and local imports', () => {
    const lines = output.split('\n');
    const importsLine = lines.find((l) => l.includes('imports: electron'));
    const localLine = lines.find((l) => l.includes('local: ./config.js'));
    expect(importsLine).toBeDefined();
    expect(localLine).toBeDefined();
  });
});

describe('buildRepoMap', () => {
  it('sets metadata correctly', () => {
    const map = buildRepoMap(sampleFiles, '2026-03-26T12:00:00.000Z');
    expect(map.metadata.generatedAt).toBe('2026-03-26T12:00:00.000Z');
    expect(map.metadata.updatedAt).toBe('2026-03-26T12:00:00.000Z');
    expect(map.metadata.fileCount).toBe(2);
    expect(map.metadata.tokenEstimate).toBeGreaterThan(0);
  });

  it('preserves file extractions', () => {
    const map = buildRepoMap(sampleFiles);
    expect(map.files).toHaveLength(2);
    expect(map.files[0].path).toBe('src/main/index.ts');
  });

  it('calculates token estimate based on formatted output', () => {
    const map = buildRepoMap(sampleFiles);
    // Token estimate should be roughly length/4 — allow ±2 for circularity
    // (the estimate itself affects the formatted length slightly)
    const formatted = formatRepoMap(map);
    const approx = Math.ceil(formatted.length / 4);
    expect(Math.abs(map.metadata.tokenEstimate - approx)).toBeLessThanOrEqual(2);
  });
});
