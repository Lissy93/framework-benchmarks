import { defineConfig } from 'vite'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  root: resolve(__dirname),
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  resolve: {
    alias: {
      '$': 'jquery',
      'jquery': 'jquery'
    }
  },
  define: {
    global: 'globalThis'
  },
  server: {
    port: 3000,
    open: false
  }
})