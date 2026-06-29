import type { SpamCheckInput } from './anti-spam.schemas.js'

export type SpamCheckResult = {
  allowed: boolean
  score: number
  reasons: string[]
}

const blockedPhrases = ['free crypto', 'telegram me', 'whatsapp only', 'casino bonus', 'loan approved']

const countMatches = (value: string, pattern: RegExp): number => value.match(pattern)?.length ?? 0

export const checkSpam = (input: SpamCheckInput, ipAddress: string): SpamCheckResult => {
  const content = input.content.toLowerCase()
  const reasons: string[] = []
  let score = 0

  const urlCount = countMatches(content, /https?:\/\//g)
  if (urlCount > 2) {
    score += 35
    reasons.push('too_many_links')
  }

  if (blockedPhrases.some((phrase) => content.includes(phrase))) {
    score += 45
    reasons.push('blocked_phrase')
  }

  if (/(.)\1{12,}/.test(content)) {
    score += 20
    reasons.push('repeated_characters')
  }

  if (countMatches(input.content, /[A-Z]/g) > input.content.length * 0.7 && input.content.length > 40) {
    score += 20
    reasons.push('excessive_caps')
  }

  if (input.context === 'signup' && urlCount > 0) {
    score += 30
    reasons.push('signup_link')
  }

  if (!ipAddress || ipAddress === 'unknown') {
    score += 10
    reasons.push('unknown_ip')
  }

  const normalizedScore = Math.min(score, 100)

  return {
    allowed: normalizedScore < 70,
    score: normalizedScore,
    reasons
  }
}

