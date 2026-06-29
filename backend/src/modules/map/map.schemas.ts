import { z } from 'zod'

const coordinate = z.coerce.number().finite()

export const mapMarkersQuerySchema = z.object({
  north: coordinate.min(-90).max(90).optional(),
  south: coordinate.min(-90).max(90).optional(),
  east: coordinate.min(-180).max(180).optional(),
  west: coordinate.min(-180).max(180).optional(),
  type: z.enum(['lost_found', 'sighting', 'colony']).optional(),
  area: z.string().trim().min(1).max(120).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50)
})

export type MapMarkersQuery = z.infer<typeof mapMarkersQuerySchema>

