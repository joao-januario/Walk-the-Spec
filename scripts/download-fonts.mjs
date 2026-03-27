#!/usr/bin/env node
// Downloads reading fonts (woff2) from fontsource CDN for bundling.
// Run: node scripts/download-fonts.mjs

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const FONTS_DIR = 'src/renderer/src/assets/fonts';
const CDN = 'https://cdn.jsdelivr.net/npm/@fontsource';

const FONTS = [
  { pkg: 'inter', family: 'Inter', weights: [400, 600, 700] },
  { pkg: 'atkinson-hyperlegible', family: 'AtkinsonHyperlegible', weights: [400, 700] },
  { pkg: 'ibm-plex-sans', family: 'IBMPlexSans', weights: [400, 600, 700] },
  { pkg: 'source-sans-3', family: 'SourceSans3', weights: [400, 600, 700] },
  { pkg: 'nunito', family: 'Nunito', weights: [400, 600, 700] },
  { pkg: 'geist-sans', family: 'GeistSans', weights: [400, 600, 700] },
  { pkg: 'jetbrains-mono', family: 'JetBrainsMono', weights: [400, 600, 700] },
];

const WEIGHT_NAMES = { 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold' };

async function download(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  mkdirSync(FONTS_DIR, { recursive: true });

  for (const font of FONTS) {
    for (const weight of font.weights) {
      const name = `${font.family}-${WEIGHT_NAMES[weight] ?? weight}`;
      const dest = join(FONTS_DIR, `${name}.woff2`);

      if (existsSync(dest)) {
        console.log(`  skip ${name} (exists)`);
        continue;
      }

      const url = `${CDN}/${font.pkg}@latest/files/${font.pkg}-latin-${weight}-normal.woff2`;
      console.log(`  fetch ${name} ...`);
      const data = await download(url);

      if (data) {
        writeFileSync(dest, data);
        console.log(`  ✓ ${name} (${(data.length / 1024).toFixed(0)}KB)`);
      } else {
        console.warn(`  ✗ ${name} — not found at ${url}`);
      }
    }
  }

  console.log('\nDone. Font files in:', FONTS_DIR);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
