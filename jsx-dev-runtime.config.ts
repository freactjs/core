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
        'jsx-dev-runtime': resolve(__dirname, 'src/jsx-dev-runtime.ts')
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
