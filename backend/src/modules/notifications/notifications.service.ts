import type { Prisma, PrismaClient } from '@prisma/client'

import { appErrors } from '../../common/errors/app-error.js'
import type { CreateNotificationInput, NotificationQuery } from './notifications.schemas.js'

export class NotificationsService {
  public constructor(private readonly db: PrismaClient) {}

  public async listForUser(userId: string, query: NotificationQuery) {
    const items = await this.db.notification.findMany({
      where: {
        userId,
        ...(query.status ? { status: query.status } : {})
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {})
    })

    const pageItems = items.slice(0, query.limit)
    const nextCursor = items.length > query.limit ? pageItems.at(-1)?.id ?? null : null

    return { items: pageItems, nextCursor }
  }

  public async create(input: CreateNotificationInput) {
    const data: Prisma.NotificationUncheckedCreateInput = {
      userId: input.userId,
      channel: input.channel,
      title: input.title,
      body: input.body
    }

    if (input.payload !== undefined) {
      data.payload = input.payload
    }

    return this.db.notification.create({
      data
    })
  }

  public async markRead(userId: string, id: string) {
    const notification = await this.db.notification.findFirst({ where: { id, userId } })

    if (!notification) {
      throw appErrors.notFound('Notification not found.')
    }

    return this.db.notification.update({
      where: { id },
      data: {
        status: 'READ',
        readAt: new Date()
      }
    })
  }
}
