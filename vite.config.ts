import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve('./src')
    }
  },
  build: {
    target: 'esnext',
    minify: true,
    rollupOptions: {
      output: {
        exports: 'named'
      }
    },
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Freact',
      formats: ['es', 'umd', 'iife'],
      fileName(format) {
        const names = {
          'es': 'freact.es.js',
          'umd': 'freact.umd.js',
          'iife': 'freact.iife.js'
        } as any;

        if (!names[format]) throw new Error(`Unsupported format '${format}'`);
        return names[format];
      }
    }
  }
});
