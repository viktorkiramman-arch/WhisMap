import type { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'

import { AppError } from '../common/errors/app-error.js'

export const installErrorHandlers = (app: FastifyInstance): void => {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'One or more fields are invalid.',
          requestId: request.id,
          details: error.issues.map((issue) => ({
            path: issue.path.join('.') || 'body',
            message: issue.message
          }))
        }
      })
    }

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message,
          requestId: request.id
        }
      })
    }

    request.log.error({ error, requestId: request.id }, 'Unhandled request error')

    return reply.status(500).send({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred.',
        requestId: request.id
      }
    })
  })

  app.setNotFoundHandler((request, reply) => {
    return reply.status(404).send({
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found.',
        requestId: request.id
      }
    })
  })
}
