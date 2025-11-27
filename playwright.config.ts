import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://localhost:3000' },
  webServer: { command: 'pnpm dev', port: 3000, timeout: 120_000, reuseExistingServer: true }
})
