import { z } from 'zod'

export const sendEmailSchema = z.object({
  recipientUserId: z.string().cuid(),
  subject: z.string().trim().min(1).max(140),
  body: z.string().trim().min(1).max(4_000),
  payload: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional()
})

export type SendEmailInput = z.infer<typeof sendEmailSchema>

