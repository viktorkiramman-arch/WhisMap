import jwt from '@fastify/jwt'
import type { FastifyInstance } from 'fastify'

import { env } from '../config/env.js'
import { appErrors } from '../common/errors/app-error.js'

export const installAuth = async (app: FastifyInstance): Promise<void> => {
  await app.register(jwt, {
    secret: env.JWT_ACCESS_SECRET,
    sign: { expiresIn: '15m' }
  })

  app.decorate('authenticate', async (request) => {
    try {
      await request.jwtVerify()
    } catch {
      throw appErrors.authenticationRequired()
    }
  })
}
