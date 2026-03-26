import { describe, it, expect } from 'vitest';
import { normalizePath, normalizePathForComparison } from '../../src/main/utils/paths.js';

describe('normalizePath', () => {
  it('converts backslashes to forward slashes', () => {
    expect(normalizePath('specs\\004-feature\\spec.md')).toBe('specs/004-feature/spec.md');
  });

  it('leaves forward-slash paths unchanged', () => {
    expect(normalizePath('specs/004-feature/spec.md')).toBe('specs/004-feature/spec.md');
  });

  it('handles Windows absolute paths', () => {
    expect(normalizePath('C:\\Users\\dev\\project')).toBe('C:/Users/dev/project');
  });

  it('handles mixed separators', () => {
    expect(normalizePath('C:\\Users/dev\\project/src')).toBe('C:/Users/dev/project/src');
  });

  it('handles empty string', () => {
    expect(normalizePath('')).toBe('');
  });

  it('handles path with no separators', () => {
    expect(normalizePath('file.md')).toBe('file.md');
  });
});

describe('normalizePathForComparison', () => {
  it('converts backslashes and lowercases', () => {
    expect(normalizePathForComparison('C:\\Users\\Dev\\Project')).toBe('c:/users/dev/project');
  });

  it('lowercases forward-slash paths', () => {
    expect(normalizePathForComparison('/Users/Dev/Project')).toBe('/users/dev/project');
  });

  it('matches same path with different separators', () => {
    const win = normalizePathForComparison('C:\\Users\\dev\\project');
    const unix = normalizePathForComparison('C:/Users/dev/project');
    expect(win).toBe(unix);
  });

  it('matches same path with different casing', () => {
    const upper = normalizePathForComparison('C:\\Users\\DEV\\Project');
    const lower = normalizePathForComparison('c:\\users\\dev\\project');
    expect(upper).toBe(lower);
  });

  it('handles empty string', () => {
    expect(normalizePathForComparison('')).toBe('');
  });
});
