import type { FastifyPluginAsync } from 'fastify'

import { env } from '../../config/env.js'

const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/health',
    {
      schema: {
        tags: ['system'],
        summary: 'Service health check',
        response: {
          200: {
            type: 'object',
            required: ['status', 'service', 'version', 'timestamp'],
            properties: {
              status: { type: 'string', example: 'ok' },
              service: { type: 'string', example: 'whismap-api' },
              version: { type: 'string', example: '0.1.0' },
              timestamp: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    },
    async () => ({
      status: 'ok',
      service: 'whismap-api',
      version: env.APP_VERSION,
      timestamp: new Date().toISOString()
    })
  )
}

export default healthRoutes
