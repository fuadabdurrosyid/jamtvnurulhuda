import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from files (.env, .env.local, etc.)
  const env = loadEnv(mode, process.cwd(), '')
  
  // Resolve keys from either system environment (Vercel) or .env files
  const firebaseConfig = process.env.__firebase_config || env.__firebase_config
  const appId = process.env.__app_id || env.__app_id

  return {
    plugins: [react(), tailwindcss()],
    define: {
      __firebase_config: firebaseConfig ? JSON.stringify(firebaseConfig) : 'undefined',
      __app_id: appId ? JSON.stringify(appId) : 'undefined'
    }
  }
})
