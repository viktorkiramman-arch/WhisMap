import type { PrismaClient } from '@prisma/client'
import type { FastifyReply, FastifyRequest } from 'fastify'

import type { UserRole } from '../common/auth/roles.js'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      sub: string
      role: UserRole
    }
    user: {
      sub: string
      role: UserRole
    }
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    db: PrismaClient
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

export {}
