import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  // Reason: keep every SFC on the Vapor compiler path, including future components
  // that might accidentally omit the per-file `vapor` marker.
  plugins: [vue({ features: { vapor: true, optionsAPI: false } })],
  base: './',
  server: {
    port: 3000
  }
});
