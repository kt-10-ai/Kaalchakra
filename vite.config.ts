import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Hot module replacement repeatedly served stale modules for the r3f scene
    // (renamed files, script-written edits), producing phantom "X is not
    // defined" errors against correct source. A full reload on change is
    // slightly slower but always shows the truth.
    hmr: false,
    watch: { usePolling: false },
  },
})
