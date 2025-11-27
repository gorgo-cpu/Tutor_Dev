import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/TutoringDE", // <--- IMPORTANT: Change REPO_NAME to your actual GitHub repository name
})
