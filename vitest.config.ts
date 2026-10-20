import { defineConfig } from 'vitest/config'

// Kept apart from vite.config.ts so the dev API middleware (and its .env.local) stay out of tests.
export default defineConfig({
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
})
