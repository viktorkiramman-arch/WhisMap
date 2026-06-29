import type { FastifyPluginAsync } from 'fastify'

import { assertMinimumRole } from '../../common/auth/authorization.js'

const databaseRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/status',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['database'],
        summary: 'Check PostgreSQL connectivity',
        security: [{ bearerAuth: [] }]
      }
    },
    async (request) => {
      assertMinimumRole(request.user.role, 'ADMIN')

      const startedAt = Date.now()
      const result = await app.db.$queryRaw<Array<{ ok: number }>>`SELECT 1 AS ok`

      return {
        data: {
          provider: 'postgresql',
          connected: result[0]?.ok === 1,
          latencyMs: Date.now() - startedAt,
          checkedAt: new Date().toISOString()
        }
      }
    }
  )
}

export default databaseRoutes

