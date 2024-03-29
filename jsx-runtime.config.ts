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
    emptyOutDir: false,
    rollupOptions: {
      input: {
        'jsx-runtime': resolve(__dirname, 'src/jsx-runtime.ts')
      }
    },
    lib: {
      entry: '',
      name: 'Freact',
      formats: ['es', 'umd'],
      fileName: (format, name) => `${name}.${format}.js`
    }
  }
});
