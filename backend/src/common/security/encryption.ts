import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

import { env } from '../../config/env.js'

const algorithm = 'aes-256-gcm'
const ivLength = 12
const authTagLength = 16

const decodeKey = (): Buffer => {
  const key = Buffer.from(env.DATA_ENCRYPTION_KEY_BASE64, 'base64')

  if (key.length !== 32) {
    throw new Error('DATA_ENCRYPTION_KEY_BASE64 must decode to exactly 32 bytes.')
  }

  return key
}

/**
 * Encrypt sensitive values before persistence. Store only the resulting string
 * in private database columns. Key rotation should be implemented before
 * production use; this helper is intentionally centralized for that change.
 */
export const encryptSensitiveValue = (plainText: string): string => {
  const iv = randomBytes(ivLength)
  const cipher = createCipheriv(algorithm, decodeKey(), iv, { authTagLength })
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  return Buffer.concat([iv, tag, encrypted]).toString('base64url')
}

export const decryptSensitiveValue = (payload: string): string => {
  const raw = Buffer.from(payload, 'base64url')
  const iv = raw.subarray(0, ivLength)
  const tag = raw.subarray(ivLength, ivLength + authTagLength)
  const encrypted = raw.subarray(ivLength + authTagLength)
  const decipher = createDecipheriv(algorithm, decodeKey(), iv, { authTagLength })

  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}
