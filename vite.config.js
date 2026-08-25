import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5173,
    open: true
  },
  build: {
    target: 'ES2020',
    minify: 'terser',
    sourcemap: false,
    outDir: 'dist',
    assetsDir: 'assets'
  },
  define: {
    'process.env': process.env
  }
})
