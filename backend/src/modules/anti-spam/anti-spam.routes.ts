import type { FastifyPluginAsync } from 'fastify'

import { spamCheckSchema } from './anti-spam.schemas.js'
import { checkSpam } from './anti-spam.service.js'

const antiSpamRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    '/check',
    {
      config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
      schema: { tags: ['anti-spam'], summary: 'Score user-submitted content for spam signals' }
    },
    async (request) => {
      const input = spamCheckSchema.parse(request.body)
      return { data: checkSpam(input, request.ip) }
    }
  )
}

export default antiSpamRoutes

