import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig(({ command }) => ({
  // serve: public/ is available at /resume.pdf for the demo
  // build: don't copy public/ into dist (consumers bring their own resume)
  publicDir: command === 'serve' ? 'public' : false,
  plugins: [
    react(),
    dts({
      include: ['src'],
      exclude: ['src/vite-env.d.ts'],
      beforeWriteFile: (filePath, content) => ({
        filePath,
        // strip ?raw import lines from generated .d.ts — they're internal
        content: content.replace(/^import\s+\S+\s+from\s+['"][^'"]+\?raw['"];?\n?/gm, ''),
      }),
      outDir: 'dist',
      insertTypesEntry: true,
      rollupTypes: false,
      copyDtsFiles: true,
      tsconfigPath: './tsconfig.app.json',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PortfolioAssistantSDK',
      formats: ['es', 'umd'],
      fileName: (format) =>
        format === 'es'
          ? 'portfolio-assistant-sdk.js'
          : 'portfolio-assistant-sdk.umd.cjs',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'pdfjs-dist'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'ReactJSXRuntime',
        },
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
}));
