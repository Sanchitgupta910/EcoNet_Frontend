import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr';
import path from "path"
// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    fs: {
      strict: false
    },
    proxy: {
      '/api': 'http://localhost:3000',
    },
},
  plugins: [react(), svgr({
    include: '**/*.svg',
    svgrOptions: {
      exportType: 'default',
    },
  })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
