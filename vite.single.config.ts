// Build variant: the whole app (JS, CSS) inlined into one index.html that opens with a double click.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: { outDir: 'dist-single', emptyOutDir: true },
});
