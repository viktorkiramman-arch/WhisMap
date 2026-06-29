import { z } from 'zod'

const coordinate = z.coerce.number().finite()
const latitude = coordinate.min(-90).max(90)
const longitude = coordinate.min(-180).max(180)

export const forwardGeocodeSchema = z.object({
  query: z.string().trim().min(2).max(200),
  limit: z.coerce.number().int().min(1).max(10).default(5)
})

export const reverseGeocodeSchema = z.object({
  latitude,
  longitude
})

export type ForwardGeocodeInput = z.infer<typeof forwardGeocodeSchema>
export type ReverseGeocodeInput = z.infer<typeof reverseGeocodeSchema>

