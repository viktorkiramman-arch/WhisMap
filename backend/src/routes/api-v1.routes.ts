import type { FastifyPluginAsync } from 'fastify'

import antiSpamRoutes from '../modules/anti-spam/anti-spam.routes.js'
import authRoutes from '../modules/auth/auth.routes.js'
import databaseRoutes from '../modules/database/database.routes.js'
import emailRoutes from '../modules/email/email.routes.js'
import geocodingRoutes from '../modules/geocoding/geocoding.routes.js'
import mapRoutes from '../modules/map/map.routes.js'
import mediaRoutes from '../modules/media/media.routes.js'
import notificationsRoutes from '../modules/notifications/notifications.routes.js'

const apiV1Routes: FastifyPluginAsync = async (app) => {
  app.get('/', { schema: { tags: ['system'], summary: 'API version metadata' } }, async () => ({
    data: {
      version: 'v1',
      modules: [
        'auth',
        'database',
        'map',
        'geocoding',
        'media',
        'email',
        'anti-spam',
        'notifications',
        'cats',
        'care',
        'lost-found',
        'sightings',
        'colonies',
        'moderation'
      ]
    }
  }))

  await app.register(authRoutes, { prefix: '/auth' })
  await app.register(databaseRoutes, { prefix: '/database' })
  await app.register(mapRoutes, { prefix: '/map' })
  await app.register(geocodingRoutes, { prefix: '/geocoding' })
  await app.register(mediaRoutes, { prefix: '/media' })
  await app.register(emailRoutes, { prefix: '/email' })
  await app.register(antiSpamRoutes, { prefix: '/anti-spam' })
  await app.register(notificationsRoutes, { prefix: '/notifications' })
}

export default apiV1Routes
