import type { FastifyPluginAsync } from 'fastify'

import authRoutes from '../modules/auth/auth.routes.js'

const apiV1Routes: FastifyPluginAsync = async (app) => {
  app.get('/', { schema: { tags: ['system'], summary: 'API version metadata' } }, async () => ({
    data: {
      version: 'v1',
      modules: ['auth', 'cats', 'care', 'lost-found', 'sightings', 'colonies', 'moderation', 'media', 'notifications']
    }
  }))

  await app.register(authRoutes, { prefix: '/auth' })
}

export default apiV1Routes
