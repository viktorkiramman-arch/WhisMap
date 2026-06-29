import type { FastifyPluginAsync } from 'fastify'

import { assertMinimumRole } from '../../common/auth/authorization.js'
import {
  createNotificationSchema,
  notificationIdParamsSchema,
  notificationQuerySchema
} from './notifications.schemas.js'
import { NotificationsService } from './notifications.service.js'

const notificationsRoutes: FastifyPluginAsync = async (app) => {
  const service = new NotificationsService(app.db)

  app.get(
    '/',
    {
      preHandler: app.authenticate,
      schema: { tags: ['notifications'], summary: 'List notifications for the authenticated user', security: [{ bearerAuth: [] }] }
    },
    async (request) => {
      const query = notificationQuerySchema.parse(request.query)
      return { data: await service.listForUser(request.user.sub, query) }
    }
  )

  app.post(
    '/',
    {
      preHandler: app.authenticate,
      schema: { tags: ['notifications'], summary: 'Create a notification for a user', security: [{ bearerAuth: [] }] }
    },
    async (request, reply) => {
      assertMinimumRole(request.user.role, 'ADMIN')

      const input = createNotificationSchema.parse(request.body)
      const notification = await service.create(input)

      return reply.status(201).send({ data: { notification } })
    }
  )

  app.patch(
    '/:id/read',
    {
      preHandler: app.authenticate,
      schema: { tags: ['notifications'], summary: 'Mark a notification as read', security: [{ bearerAuth: [] }] }
    },
    async (request) => {
      const params = notificationIdParamsSchema.parse(request.params)
      return { data: { notification: await service.markRead(request.user.sub, params.id) } }
    }
  )
}

export default notificationsRoutes

