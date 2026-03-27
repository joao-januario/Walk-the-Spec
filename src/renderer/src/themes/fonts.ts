// Reading font definitions — user-selectable via the Electron menu.
// All fonts are bundled as woff2 in src/renderer/src/assets/fonts/.

export interface ReadingFont {
  readonly id: string;
  readonly name: string;
  readonly stack: string;
}

export const DEFAULT_READING_FONT_ID = 'inter';

export const readingFonts: readonly ReadingFont[] = [
  { id: 'inter', name: 'Inter', stack: "'Inter', system-ui, sans-serif" },
  { id: 'system', name: 'System Default', stack: "system-ui, -apple-system, 'Segoe UI', sans-serif" },
  { id: 'atkinson', name: 'Atkinson Hyperlegible', stack: "'Atkinson Hyperlegible', system-ui, sans-serif" },
  { id: 'ibm-plex', name: 'IBM Plex Sans', stack: "'IBM Plex Sans', system-ui, sans-serif" },
  { id: 'source-sans', name: 'Source Sans', stack: "'Source Sans 3', system-ui, sans-serif" },
  { id: 'nunito', name: 'Nunito', stack: "'Nunito', system-ui, sans-serif" },
  { id: 'geist', name: 'Geist', stack: "'Geist', system-ui, sans-serif" },
  { id: 'jetbrains-mono', name: 'JetBrains Mono', stack: "'JetBrains Mono', monospace" },
];

export function getReadingFontById(id: string): ReadingFont | undefined {
  return readingFonts.find((f) => f.id === id);
}
