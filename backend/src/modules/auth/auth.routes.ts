import type { FastifyPluginAsync } from 'fastify'

import { loginSchema, registerSchema } from './auth.schemas.js'
import { AuthService } from './auth.service.js'

const authRoutes: FastifyPluginAsync = async (app) => {
  const service = new AuthService(app.db)

  app.post(
    '/register',
    {
      config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
      schema: { tags: ['auth'], summary: 'Create a new account' }
    },
    async (request, reply) => {
      const input = registerSchema.parse(request.body)
      const user = await service.register(input)
      const accessToken = app.jwt.sign({ sub: user.id, role: user.role })

      return reply.status(201).send({ data: { user, accessToken } })
    }
  )

  app.post(
    '/login',
    {
      config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
      schema: { tags: ['auth'], summary: 'Start an authenticated session' }
    },
    async (request) => {
      const input = loginSchema.parse(request.body)
      const user = await service.login(input)
      const accessToken = app.jwt.sign({ sub: user.id, role: user.role })

      return { data: { user, accessToken } }
    }
  )

  app.get(
    '/me',
    {
      preHandler: app.authenticate,
      schema: { tags: ['auth'], summary: 'Get the authenticated account', security: [{ bearerAuth: [] }] }
    },
    async (request) => ({ data: { user: await service.getById(request.user.sub) } })
  )
}

export default authRoutes
