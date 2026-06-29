import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Set valid test environment values before importing app in a real test runner.
// This test is intentionally a template until a disposable test database is wired.
describe.skip('health endpoint', () => {
  const context: { app?: { close: () => Promise<void>; inject: (options: { method: string; url: string }) => Promise<{ statusCode: number }> } } = {}

  beforeAll(async () => {
    process.env.DATABASE_URL = 'postgresql://whismap:whismap@localhost:5432/whismap?schema=public'
    process.env.JWT_ACCESS_SECRET = 'replace-with-a-unique-secret-at-least-32-characters-long'
    process.env.DATA_ENCRYPTION_KEY_BASE64 = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='

    const { buildApp } = await import('../src/app.js')
    context.app = await buildApp()
  })

  afterAll(async () => {
    await context.app?.close()
  })

  it('returns service metadata', async () => {
    const response = await context.app?.inject({ method: 'GET', url: '/health' })
    expect(response?.statusCode).toBe(200)
  })
})
