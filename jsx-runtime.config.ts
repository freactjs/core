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
        'jsx-runtime': resolve(__dirname, 'src/jsx-runtime.ts'),
        'jsx-dev-runtime': resolve(__dirname, 'src/jsx-dev-runtime.ts')
      }
    },
    lib: {
      entry: '',
      name: 'Freact',
      formats: ['es'],
      fileName: (format, name) => `${name}.${format}.js`
    }
  }
});
