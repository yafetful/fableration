import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    allowedHosts: true,
    proxy: {
      '/fab-api': {
        target: 'http://localhost:3001', // 你的后端端口
        changeOrigin: true,
        rewrite: path => path.replace(/^\/fab-api/, '/fab-api'),
      },
    },
  },
})
