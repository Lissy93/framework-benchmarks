import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: `import { h, Fragment } from 'preact'`
  },
  optimizeDeps: {
    include: ['preact/hooks']
  },
  server: {
    port: 3000
  }
});
