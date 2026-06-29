import { z } from 'zod'

export const imageUploadSchema = z.object({
  entityType: z.enum(['cat', 'lost_found_report', 'sighting', 'colony', 'concern_report']),
  entityId: z.string().trim().min(1).max(128),
  visibility: z.enum(['PRIVATE', 'HOUSEHOLD', 'TRUSTED', 'PUBLIC']).default('PRIVATE'),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  contentBase64: z.string().min(1).max(7_000_000)
})

export type ImageUploadInput = z.infer<typeof imageUploadSchema>

