import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import type { FastifyInstance } from 'fastify'

import { allowedOrigins, env } from '../config/env.js'

export const installSecurity = async (app: FastifyInstance): Promise<void> => {
  await app.register(helmet, {
    ...(env.NODE_ENV === 'production' ? {} : { contentSecurityPolicy: false }),
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })

  await app.register(cors, {
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
        return
      }

      callback(new Error('Origin is not allowed by CORS.'), false)
    },
    credentials: false,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Request-Id'],
    maxAge: 60 * 60
  })

  await app.register(rateLimit, {
    global: true,
    max: 120,
    timeWindow: '1 minute',
    hook: 'onRequest',
    errorResponseBuilder: (request, context) => ({
      error: {
        code: 'RATE_LIMITED',
        message: `Too many requests. Try again in ${context.after}.`,
        requestId: request.id
      }
    })
  })
}
