import type { FastifyPluginAsync } from 'fastify'

import { assertMinimumRole } from '../../common/auth/authorization.js'
import { sendEmailSchema } from './email.schemas.js'
import { EmailService } from './email.service.js'

const emailRoutes: FastifyPluginAsync = async (app) => {
  const service = new EmailService(app.db)

  app.post(
    '/send',
    {
      preHandler: app.authenticate,
      config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
      schema: {
        tags: ['email'],
        summary: 'Queue an outbound email notification',
        security: [{ bearerAuth: [] }]
      }
    },
    async (request, reply) => {
      assertMinimumRole(request.user.role, 'ADMIN')

      const input = sendEmailSchema.parse(request.body)
      const email = await service.queueEmail(input)

      return reply.status(202).send({ data: { email } })
    }
  )
}

export default emailRoutes

