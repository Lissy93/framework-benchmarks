import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 3000,
    open: false
  },
  build: {
    target: 'esnext',
    lib: {
      entry: 'index.html',
      formats: ['es']
    },
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  }
});
