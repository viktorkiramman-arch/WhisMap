import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import type { FastifyInstance } from 'fastify'

import { env } from '../config/env.js'

export const installOpenApi = async (app: FastifyInstance): Promise<void> => {
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'WhisMap API',
        description: 'WhisMap community care API. Public records never include exact protected locations or private contact details.',
        version: env.APP_VERSION
      },
      servers: [{ url: '/api/v1', description: 'Version 1' }],
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
        }
      }
    }
  })

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list', deepLinking: false },
    staticCSP: env.NODE_ENV === 'production'
  })
}
