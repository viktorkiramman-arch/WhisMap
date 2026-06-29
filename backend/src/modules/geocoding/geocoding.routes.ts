import type { FastifyPluginAsync } from 'fastify'

import { forwardGeocodeSchema, reverseGeocodeSchema } from './geocoding.schemas.js'
import { GeocodingService } from './geocoding.service.js'

const geocodingRoutes: FastifyPluginAsync = async (app) => {
  const service = new GeocodingService()

  app.post(
    '/forward',
    {
      config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
      schema: { tags: ['geocoding'], summary: 'Resolve a search query to public map candidates' }
    },
    async (request) => {
      const input = forwardGeocodeSchema.parse(request.body)
      return { data: { results: service.forward(input) } }
    }
  )

  app.post(
    '/reverse',
    {
      config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
      schema: { tags: ['geocoding'], summary: 'Resolve coordinates to an approximate public area' }
    },
    async (request) => {
      const input = reverseGeocodeSchema.parse(request.body)
      return { data: service.reverse(input) }
    }
  )
}

export default geocodingRoutes

