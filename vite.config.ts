import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
    open: '/admin',
    // Proxy disabled - using direct API URL from .env (VITE_API_URL)
    // This allows connecting to Render backend directly
  },
})
