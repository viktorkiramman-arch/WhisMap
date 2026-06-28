import type { FastifyReply } from 'fastify'

export type ApiErrorResponse = {
  error: {
    code: string
    message: string
    requestId: string
    details?: Array<{ path: string; message: string }>
  }
}

export const sendNoContent = (reply: FastifyReply): FastifyReply => reply.status(204).send()
