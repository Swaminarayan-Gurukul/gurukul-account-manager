import tailwindcssPlugin from '@tailwindcss/vite';
import viteReactPlugin from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import viteConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  root: resolve(__dirname, 'src/client'),
  plugins: [
    tailwindcssPlugin(),
    viteConfigPaths(),
    viteReactPlugin(),
    viteSingleFile(),
  ],
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: false,
    reportCompressedSize: false,
  },
});
