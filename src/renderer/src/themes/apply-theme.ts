// Applies a theme by setting CSS custom properties on <html>.
// The default theme (catppuccin-mocha) removes all overrides, falling back to @theme values.

import { getThemeById, DEFAULT_THEME_ID } from './themes.js';
import type { ThemeDefinition } from './themes.js';

function removeAllOverrides(): void {
  const el = document.documentElement;
  // Remove all --color-* and --shadow-* inline styles
  const toRemove: string[] = [];
  for (let i = 0; i < el.style.length; i++) {
    const prop = el.style[i];
    if (prop !== undefined && (prop.startsWith('--color-') || prop.startsWith('--shadow-'))) {
      toRemove.push(prop);
    }
  }
  for (const prop of toRemove) {
    el.style.removeProperty(prop);
  }
  el.removeAttribute('data-theme-mode');
}

function applyOverrides(theme: ThemeDefinition): void {
  const el = document.documentElement;
  for (const [prop, value] of Object.entries(theme.colors)) {
    el.style.setProperty(prop, value);
  }
  if (theme.category === 'light') {
    el.setAttribute('data-theme-mode', 'light');
  } else {
    el.removeAttribute('data-theme-mode');
  }
}

export function applyTheme(themeId: string): string {
  const theme = getThemeById(themeId);
  const resolved = theme ?? getThemeById(DEFAULT_THEME_ID);

  // Always clear first to avoid stale vars from a previous theme
  removeAllOverrides();

  // Default theme uses @theme CSS values — no overrides needed
  if (resolved && resolved.id !== DEFAULT_THEME_ID) {
    applyOverrides(resolved);
  }

  return resolved?.id ?? DEFAULT_THEME_ID;
}
