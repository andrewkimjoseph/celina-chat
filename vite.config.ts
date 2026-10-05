import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'

const walletConnectProjectIdKey = 'VITE_WALLETCONNECT_PROJECT_ID'

function walletConnectProjectIdFromWrangler() {
  const wrangler = JSON.parse(
    readFileSync(new URL('./wrangler.jsonc', import.meta.url), 'utf8'),
  )
  const projectId = wrangler.vars?.[walletConnectProjectIdKey]?.trim()
  if (!projectId) {
    throw new Error(
      `${walletConnectProjectIdKey} is missing from wrangler.jsonc vars`,
    )
  }
  return projectId
}

if (!process.env[walletConnectProjectIdKey]?.trim()) {
  process.env[walletConnectProjectIdKey] = walletConnectProjectIdFromWrangler()
}

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
