import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { buildApp } from '../src/app.js'

// Set valid test environment values before importing app in a real test runner.
// This test is intentionally a template until a disposable test database is wired.
describe.skip('health endpoint', () => {
  const context: { app?: Awaited<ReturnType<typeof buildApp>> } = {}

  beforeAll(async () => {
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
