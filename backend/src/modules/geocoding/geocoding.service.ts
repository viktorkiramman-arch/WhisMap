import { toApproximateCoordinate } from '../../common/security/location-privacy.js'
import type { ForwardGeocodeInput, ReverseGeocodeInput } from './geocoding.schemas.js'

export type GeocodeResult = {
  label: string
  latitude: number | null
  longitude: number | null
  precision: 'coordinate' | 'area'
  source: 'local'
}

const coordinatePairPattern = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/

export class GeocodingService {
  public forward(input: ForwardGeocodeInput): GeocodeResult[] {
    const match = coordinatePairPattern.exec(input.query)

    if (match) {
      const latitudeValue = Number(match[1])
      const longitudeValue = Number(match[2])

      if (latitudeValue >= -90 && latitudeValue <= 90 && longitudeValue >= -180 && longitudeValue <= 180) {
        return [
          {
            label: `${toApproximateCoordinate(latitudeValue)}, ${toApproximateCoordinate(longitudeValue)}`,
            latitude: toApproximateCoordinate(latitudeValue),
            longitude: toApproximateCoordinate(longitudeValue),
            precision: 'coordinate',
            source: 'local'
          }
        ]
      }
    }

    const areaResult: GeocodeResult = {
      label: input.query,
      latitude: null,
      longitude: null,
      precision: 'area',
      source: 'local'
    }

    return [areaResult].slice(0, input.limit)
  }

  public reverse(input: ReverseGeocodeInput): GeocodeResult {
    const latitude = toApproximateCoordinate(input.latitude)
    const longitude = toApproximateCoordinate(input.longitude)

    return {
      label: `Area near ${latitude}, ${longitude}`,
      latitude,
      longitude,
      precision: 'area',
      source: 'local'
    }
  }
}
