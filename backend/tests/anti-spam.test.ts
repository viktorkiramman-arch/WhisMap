import { describe, expect, it } from 'vitest'

import { checkSpam } from '../src/modules/anti-spam/anti-spam.service.js'

describe('checkSpam', () => {
  it('allows normal care content', () => {
    const result = checkSpam(
      {
        context: 'report',
        content: 'I saw a ginger cat near the north gate around 7 PM. It looked healthy but hungry.'
      },
      '127.0.0.1'
    )

    expect(result.allowed).toBe(true)
    expect(result.score).toBeLessThan(70)
  })

  it('blocks high-risk spam content', () => {
    const result = checkSpam(
      {
        context: 'signup',
        content: 'FREE CRYPTO casino bonus https://a.test https://b.test https://c.test'
      },
      '127.0.0.1'
    )

    expect(result.allowed).toBe(false)
    expect(result.reasons).toContain('blocked_phrase')
  })
})

