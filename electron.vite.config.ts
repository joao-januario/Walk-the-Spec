import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({ include: ['typescript', 'web-tree-sitter', 'tree-sitter-wasms', 'electron-updater', 'electron-log'] })],
    define: {
      __dirname: 'import.meta.dirname',
    },
    build: {
      outDir: 'out/main',
      rollupOptions: {
        input: 'src/main/index.ts',
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/preload',
      lib: {
        entry: 'src/preload/index.ts',
        formats: ['cjs'],
      },
      rollupOptions: {
        output: {
          entryFileNames: '[name].js',
        },
      },
    },
  },
  renderer: {
    root: 'src/renderer',
    plugins: [react(), tailwindcss()],
    build: {
      outDir: 'out/renderer',
      rollupOptions: {
        input: 'src/renderer/index.html',
      },
    },
  },
});
