// https://vite.dev/config/
import react from '@vitejs/plugin-react'

export default {
  base: process.env.NODE_ENV === 'production' ? '/josolinap.github.io/repocontext/",' : '/',
  plugins: [react()],
}
