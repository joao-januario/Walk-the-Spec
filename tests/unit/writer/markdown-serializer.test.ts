import { describe, it, expect } from 'vitest';
import { spliceAtPosition } from '../../../src/main/writer/markdown-serializer.js';

describe('markdown-serializer', () => {
  describe('spliceAtPosition', () => {
    it('replaces text at exact byte position', () => {
      const original = 'Hello World';
      // Replace "World" (offset 6, length 5)
      const result = spliceAtPosition(original, 6, 11, 'Universe');
      expect(result).toBe('Hello Universe');
    });

    it('preserves everything outside the splice range', () => {
      const original = 'Line 1\nLine 2\nLine 3\n';
      // Replace "Line 2" (offset 7, end 13)
      const result = spliceAtPosition(original, 7, 13, 'REPLACED');
      expect(result).toBe('Line 1\nREPLACED\nLine 3\n');
    });

    it('toggles checkbox from unchecked to checked', () => {
      const original = '- [ ] T001 Do something\n- [ ] T002 Do another\n';
      // The "[ ]" for T001 starts at offset 2, ends at 5
      const result = spliceAtPosition(original, 2, 5, '[x]');
      expect(result).toBe('- [x] T001 Do something\n- [ ] T002 Do another\n');
    });

    it('toggles checkbox from checked to unchecked', () => {
      const original = '- [x] T001 Done\n';
      const result = spliceAtPosition(original, 2, 5, '[ ]');
      expect(result).toBe('- [ ] T001 Done\n');
    });

    it('handles multi-byte unicode correctly', () => {
      const original = 'Hello 🌍 World';
      // "🌍" is 2 bytes in JS string (surrogate pair), but we work with string offsets
      const worldStart = original.indexOf('World');
      const result = spliceAtPosition(original, worldStart, worldStart + 5, 'Earth');
      expect(result).toBe('Hello 🌍 Earth');
    });

    it('handles replacement shorter than original', () => {
      const original = 'abcdefgh';
      const result = spliceAtPosition(original, 2, 6, 'X');
      expect(result).toBe('abXgh');
    });

    it('handles replacement longer than original', () => {
      const original = 'abcdefgh';
      const result = spliceAtPosition(original, 2, 4, 'XXXX');
      expect(result).toBe('abXXXXefgh');
    });

    it('handles splice at start of string', () => {
      const original = 'Hello';
      const result = spliceAtPosition(original, 0, 5, 'Goodbye');
      expect(result).toBe('Goodbye');
    });

    it('handles splice at end of string', () => {
      const original = 'Hello World';
      const result = spliceAtPosition(original, 6, 11, 'Earth');
      expect(result).toBe('Hello Earth');
    });
  });
});
