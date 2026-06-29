import type { PrismaClient } from '@prisma/client'

import { toApproximateCoordinate } from '../../common/security/location-privacy.js'
import type { MapMarkersQuery } from './map.schemas.js'

type MarkerType = 'lost_found' | 'sighting' | 'colony'

export type MapMarker = {
  id: string
  type: MarkerType
  title: string
  publicArea: string
  latitude: number | null
  longitude: number | null
  updatedAt: string
}

const isWithinBounds = (
  latitude: number | null,
  longitude: number | null,
  query: MapMarkersQuery
): boolean => {
  if (latitude === null || longitude === null) {
    return false
  }

  if (query.north === undefined || query.south === undefined || query.east === undefined || query.west === undefined) {
    return true
  }

  return latitude <= query.north && latitude >= query.south && longitude <= query.east && longitude >= query.west
}

export class MapService {
  public constructor(private readonly db: PrismaClient) {}

  public async listMarkers(query: MapMarkersQuery): Promise<MapMarker[]> {
    const markers: MapMarker[] = []
    const areaFilter = query.area ? { contains: query.area, mode: 'insensitive' as const } : undefined
    const fetchLimit = query.limit * 2

    if (!query.type || query.type === 'lost_found') {
      const reports = await this.db.lostFoundReport.findMany({
        where: {
          status: 'ACTIVE',
          reviewStatus: 'VERIFIED',
          ...(areaFilter ? { publicArea: areaFilter } : {})
        },
        orderBy: { updatedAt: 'desc' },
        take: fetchLimit
      })

      markers.push(
        ...reports.map((report) => ({
          id: report.id,
          type: 'lost_found' as const,
          title: report.catName ?? `${report.type.toLowerCase()} cat`,
          publicArea: report.publicArea,
          latitude:
            report.approximateLatitude === null ? null : toApproximateCoordinate(report.approximateLatitude),
          longitude:
            report.approximateLongitude === null ? null : toApproximateCoordinate(report.approximateLongitude),
          updatedAt: report.updatedAt.toISOString()
        }))
      )
    }

    if (!query.type || query.type === 'sighting') {
      const sightings = await this.db.sighting.findMany({
        where: areaFilter ? { publicArea: areaFilter } : {},
        orderBy: { observedAt: 'desc' },
        take: fetchLimit
      })

      markers.push(
        ...sightings.map((sighting) => ({
          id: sighting.id,
          type: 'sighting' as const,
          title: 'Cat sighting',
          publicArea: sighting.publicArea,
          latitude:
            sighting.approximateLatitude === null ? null : toApproximateCoordinate(sighting.approximateLatitude),
          longitude:
            sighting.approximateLongitude === null ? null : toApproximateCoordinate(sighting.approximateLongitude),
          updatedAt: sighting.updatedAt.toISOString()
        }))
      )
    }

    if (!query.type || query.type === 'colony') {
      const colonies = await this.db.colony.findMany({
        where: {
          visibility: { not: 'PRIVATE' },
          ...(areaFilter ? { publicArea: areaFilter } : {})
        },
        orderBy: { updatedAt: 'desc' },
        take: fetchLimit
      })

      markers.push(
        ...colonies.map((colony) => ({
          id: colony.id,
          type: 'colony' as const,
          title: colony.name,
          publicArea: colony.publicArea,
          latitude:
            colony.approximateLatitude === null ? null : toApproximateCoordinate(colony.approximateLatitude),
          longitude:
            colony.approximateLongitude === null ? null : toApproximateCoordinate(colony.approximateLongitude),
          updatedAt: colony.updatedAt.toISOString()
        }))
      )
    }

    return markers
      .filter((marker) => isWithinBounds(marker.latitude, marker.longitude, query))
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .slice(0, query.limit)
  }
}

