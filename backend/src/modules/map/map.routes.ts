import type { FastifyPluginAsync } from 'fastify'

import { mapMarkersQuerySchema } from './map.schemas.js'
import { MapService } from './map.service.js'

const mapRoutes: FastifyPluginAsync = async (app) => {
  const service = new MapService(app.db)

  app.get(
    '/markers',
    {
      schema: { tags: ['map'], summary: 'List public map markers with approximate coordinates' }
    },
    async (request) => {
      const query = mapMarkersQuerySchema.parse(request.query)
      return { data: { markers: await service.listMarkers(query) } }
    }
  )
}

export default mapRoutes

