export type PublicLocation = {
  area: string
  latitude: number | null
  longitude: number | null
}

/**
 * Public endpoints must receive only a broad area and an intentionally reduced
 * coordinate precision. Exact values remain encrypted and never enter public DTOs.
 */
export const toApproximateCoordinate = (value: number, decimals = 2): number => {
  const multiplier = 10 ** decimals
  return Math.round(value * multiplier) / multiplier
}
