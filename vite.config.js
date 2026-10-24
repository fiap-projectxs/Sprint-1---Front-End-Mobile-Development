import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // host: true faz o servidor aceitar localhost e 127.0.0.1 (IPv4 e IPv6).
  server: { host: true, port: 5173 },
  // Railway: o preview serve o build em 0.0.0.0:$PORT e aceita o domínio gerado (*.up.railway.app).
  preview: { host: true, allowedHosts: true },
})
