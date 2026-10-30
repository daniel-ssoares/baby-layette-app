/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'

// `vite preview` usa os mesmos cabeçalhos de segurança da Vercel (CSP etc.), para testar o build como em produção.
const vercel = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8'))
const cabecalhos: Record<string, string> = Object.fromEntries(
  vercel.headers.find((h: { source: string }) => h.source === '/(.*)').headers
    .filter((h: { key: string }) => h.key !== 'Strict-Transport-Security')
    .map((h: { key: string; value: string }) => [h.key, h.value]))

export default defineConfig({
  plugins: [react()],
  preview: { headers: cabecalhos },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
