import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { PrismaClient } from '@prisma/client'

import { env } from '../../config/env.js'
import { appErrors } from '../../common/errors/app-error.js'
import type { ImageUploadInput } from './media.schemas.js'

const maxImageBytes = 5 * 1024 * 1024

const extensionByMimeType: Record<ImageUploadInput['mimeType'], string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
}

const hasExpectedSignature = (mimeType: ImageUploadInput['mimeType'], bytes: Buffer): boolean => {
  if (mimeType === 'image/jpeg') {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  }

  if (mimeType === 'image/png') {
    return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  }

  if (mimeType === 'image/webp') {
    return bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP'
  }

  return bytes.subarray(0, 3).toString('ascii') === 'GIF'
}

export class MediaService {
  public constructor(private readonly db: PrismaClient) {}

  public async storeImage(ownerId: string, input: ImageUploadInput) {
    const bytes = Buffer.from(input.contentBase64, 'base64')

    if (bytes.length === 0 || bytes.length > maxImageBytes) {
      throw appErrors.badRequest('Image must be between 1 byte and 5 MB.')
    }

    if (!hasExpectedSignature(input.mimeType, bytes)) {
      throw appErrors.badRequest('Image bytes do not match the declared MIME type.')
    }

    const objectKey = `${ownerId}/${randomUUID()}.${extensionByMimeType[input.mimeType]}`
    const absoluteStorageRoot = path.resolve(env.MEDIA_STORAGE_DIR)
    const absoluteFilePath = path.resolve(absoluteStorageRoot, objectKey)

    if (!absoluteFilePath.startsWith(absoluteStorageRoot)) {
      throw appErrors.badRequest('Invalid storage path.')
    }

    await mkdir(path.dirname(absoluteFilePath), { recursive: true })
    await writeFile(absoluteFilePath, bytes, { flag: 'wx' })

    return this.db.mediaAsset.create({
      data: {
        ownerId,
        entityType: input.entityType,
        entityId: input.entityId,
        objectKey,
        mimeType: input.mimeType,
        byteSize: bytes.length,
        visibility: input.visibility,
        scanStatus: 'PENDING'
      },
      select: {
        id: true,
        entityType: true,
        entityId: true,
        objectKey: true,
        mimeType: true,
        byteSize: true,
        visibility: true,
        scanStatus: true,
        createdAt: true
      }
    })
  }
}

