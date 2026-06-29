import type { FastifyPluginAsync } from 'fastify'

import { imageUploadSchema } from './media.schemas.js'
import { MediaService } from './media.service.js'

const mediaRoutes: FastifyPluginAsync = async (app) => {
  const service = new MediaService(app.db)

  app.post(
    '/images',
    {
      bodyLimit: 7_250_000,
      preHandler: app.authenticate,
      config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
      schema: {
        tags: ['media'],
        summary: 'Upload and register an image asset',
        security: [{ bearerAuth: [] }]
      }
    },
    async (request, reply) => {
      const input = imageUploadSchema.parse(request.body)
      const asset = await service.storeImage(request.user.sub, input)

      return reply.status(201).send({ data: { asset } })
    }
  )
}

export default mediaRoutes

