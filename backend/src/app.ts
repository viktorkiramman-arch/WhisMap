import Fastify from 'fastify'

import { env } from './config/env.js'
import { installErrorHandlers } from './plugins/error-handler.js'
import { installDatabase } from './plugins/database.js'
import { installSecurity } from './plugins/security.js'
import { installAuth } from './plugins/auth.js'
import { installOpenApi } from './plugins/openapi.js'
import healthRoutes from './modules/health/health.routes.js'
import apiV1Routes from './routes/api-v1.routes.js'

const buildLogger = () => {
  const base = {
    level: env.LOG_LEVEL,
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'body.password',
        'body.contactMethod',
        'body.privateLocation',
        'body.exactLocation'
      ],
      censor: '[REDACTED]'
    }
  }

  if (env.NODE_ENV !== 'development') {
    return base
  }

  return {
    ...base,
    transport: {
      target: 'pino-pretty',
      options: { translateTime: 'SYS:standard', ignore: 'pid,hostname' }
    }
  }
}

export const buildApp = async () => {
  const app = Fastify({
    logger: buildLogger(),
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestId',
    trustProxy: env.NODE_ENV === 'production'
  })

  installErrorHandlers(app)
  await installSecurity(app)
  await installDatabase(app)
  await installAuth(app)
  await installOpenApi(app)

  await app.register(healthRoutes)
  await app.register(apiV1Routes, { prefix: '/api/v1' })

  return app
}
