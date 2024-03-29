import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    extensions: ['.ts', '.tsx'],
    alias: {
      '@': resolve('./src')
    }
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        freact: resolve(__dirname, 'src/index.ts')
      }
    },
    lib: {
      entry: '',
      name: 'Freact',
      formats: ['es', 'umd', 'iife'],
      fileName: (format, name) => `${name}.${format}.js`
    }
  }
});
