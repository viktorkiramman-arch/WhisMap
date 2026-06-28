import { PrismaClient } from '@prisma/client'
import type { FastifyInstance } from 'fastify'

export const installDatabase = async (app: FastifyInstance): Promise<void> => {
  const prisma = new PrismaClient({
    log: app.log.level === 'debug' ? ['warn', 'error'] : ['error']
  })

  await prisma.$connect()
  app.decorate('db', prisma)

  app.addHook('onClose', async () => {
    await prisma.$disconnect()
  })
}
