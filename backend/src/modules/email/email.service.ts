import type { Prisma, PrismaClient } from '@prisma/client'

import { appErrors } from '../../common/errors/app-error.js'
import type { SendEmailInput } from './email.schemas.js'

export class EmailService {
  public constructor(private readonly db: PrismaClient) {}

  public async queueEmail(input: SendEmailInput) {
    const recipient = await this.db.user.findUnique({
      where: { id: input.recipientUserId },
      select: { id: true, status: true }
    })

    if (!recipient || recipient.status !== 'ACTIVE') {
      throw appErrors.notFound('Recipient user not found.')
    }

    const data: Prisma.NotificationUncheckedCreateInput = {
      userId: recipient.id,
      channel: 'EMAIL',
      status: 'PENDING',
      title: input.subject,
      body: input.body
    }

    if (input.payload !== undefined) {
      data.payload = input.payload
    }

    return this.db.notification.create({ data })
  }
}
