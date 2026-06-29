import { z } from 'zod'

export const notificationQuerySchema = z.object({
  status: z.enum(['PENDING', 'SENT', 'FAILED', 'READ']).optional(),
  cursor: z.string().cuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20)
})

export const createNotificationSchema = z.object({
  userId: z.string().cuid(),
  channel: z.enum(['IN_APP', 'EMAIL', 'PUSH']).default('IN_APP'),
  title: z.string().trim().min(1).max(140),
  body: z.string().trim().min(1).max(2_000),
  payload: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional()
})

export const notificationIdParamsSchema = z.object({
  id: z.string().cuid()
})

export type NotificationQuery = z.infer<typeof notificationQuerySchema>
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>

