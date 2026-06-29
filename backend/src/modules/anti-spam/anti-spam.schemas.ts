import { z } from 'zod'

export const spamCheckSchema = z.object({
  content: z.string().trim().min(1).max(5_000),
  context: z.enum(['comment', 'contact_request', 'report', 'signup', 'general']).default('general')
})

export type SpamCheckInput = z.infer<typeof spamCheckSchema>

