import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  themes,
  darkThemes,
  lightThemes,
  getThemeById,
  DEFAULT_THEME_ID,
} from '../../src/renderer/src/themes/themes.js';

// All CSS variable keys that every non-default theme must define
const REQUIRED_COLOR_KEYS = [
  '--color-board-bg',
  '--color-board-surface',
  '--color-board-surface-hover',
  '--color-board-surface-alt',
  '--color-board-surface-elevated',
  '--color-board-surface-overlay',
  '--color-board-border',
  '--color-board-border-hover',
  '--color-board-text',
  '--color-board-text-muted',
  '--color-board-text-bright',
  '--color-board-accent',
  '--color-board-red',
  '--color-board-orange',
  '--color-board-yellow',
  '--color-board-green',
  '--color-board-purple',
  '--color-board-cyan',
  '--color-board-teal',
  '--color-phase-specify',
  '--color-phase-plan',
  '--color-phase-tasks',
  '--color-phase-implement',
  '--color-phase-summary',
  '--color-phase-review',
  '--color-phase-unknown',
  '--shadow-card',
  '--shadow-card-hover',
];

describe('theme definitions', () => {
  it('contains exactly 10 themes', () => {
    expect(themes).toHaveLength(10);
  });

  it('contains 8 dark themes and 2 light themes', () => {
    expect(darkThemes).toHaveLength(8);
    expect(lightThemes).toHaveLength(2);
  });

  it('has unique IDs for every theme', () => {
    const ids = themes.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('includes the default theme as first entry', () => {
    const first = themes[0];
    expect(first).toBeDefined();
    expect(first!.id).toBe(DEFAULT_THEME_ID);
  });

  it('default theme has empty colors map (uses @theme CSS)', () => {
    const defaultTheme = getThemeById(DEFAULT_THEME_ID);
    expect(defaultTheme).toBeDefined();
    expect(Object.keys(defaultTheme!.colors)).toHaveLength(0);
  });

  describe('non-default themes have all required CSS variables', () => {
    const nonDefaults = themes.filter((t) => t.id !== DEFAULT_THEME_ID);

    for (const theme of nonDefaults) {
      it(`${theme.name} defines all ${REQUIRED_COLOR_KEYS.length} required keys`, () => {
        for (const key of REQUIRED_COLOR_KEYS) {
          expect(theme.colors, `Missing ${key} in ${theme.name}`).toHaveProperty(key);
        }
      });
    }
  });

  describe('color values are valid hex or CSS shadow syntax', () => {
    const nonDefaults = themes.filter((t) => t.id !== DEFAULT_THEME_ID);
    const hexOrShadow = /^(#[0-9a-fA-F]{6}|0 .+)$/;

    for (const theme of nonDefaults) {
      it(`${theme.name} has valid color values`, () => {
        for (const [key, value] of Object.entries(theme.colors)) {
          expect(value, `Invalid value for ${key} in ${theme.name}`).toMatch(hexOrShadow);
        }
      });
    }
  });

  it('dark themes are listed in the correct order per spec', () => {
    const expectedOrder = [
      'radix-mauve',
      'dracula',
      'tokyo-night',
      'one-dark',
      'rose-pine',
      'catppuccin-mocha',
      'gruvbox-dark',
      'solarized-dark',
    ];
    expect(darkThemes.map((t) => t.id)).toEqual(expectedOrder);
  });

  it('light themes are listed in the correct order per spec', () => {
    const expectedOrder = ['solarized-light', 'catppuccin-latte'];
    expect(lightThemes.map((t) => t.id)).toEqual(expectedOrder);
  });
});

describe('getThemeById', () => {
  it('returns the matching theme for a valid ID', () => {
    const theme = getThemeById('dracula');
    expect(theme).toBeDefined();
    expect(theme!.name).toBe('Dracula');
  });

  it('returns undefined for an unknown ID', () => {
    expect(getThemeById('nonexistent')).toBeUndefined();
  });
});
