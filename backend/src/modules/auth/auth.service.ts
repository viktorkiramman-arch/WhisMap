import argon2 from 'argon2'
import type { PrismaClient, User } from '@prisma/client'

import { appErrors } from '../../common/errors/app-error.js'
import type { LoginInput, RegisterInput } from './auth.schemas.js'

export type SafeUser = Pick<User, 'id' | 'displayName' | 'email' | 'role' | 'createdAt'>

const toSafeUser = (user: User): SafeUser => ({
  id: user.id,
  displayName: user.displayName,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt
})

export class AuthService {
  public constructor(private readonly db: PrismaClient) {}

  public async register(input: RegisterInput): Promise<SafeUser> {
    const existing = await this.db.user.findUnique({ where: { email: input.email } })

    if (existing) {
      throw appErrors.conflict('An account with this email already exists.')
    }

    const passwordHash = await argon2.hash(input.password, {
      type: argon2.argon2id,
      memoryCost: 19_456,
      timeCost: 2,
      parallelism: 1
    })

    const user = await this.db.user.create({
      data: {
        displayName: input.displayName,
        email: input.email,
        passwordHash
      }
    })

    return toSafeUser(user)
  }

  public async login(input: LoginInput): Promise<SafeUser> {
    const user = await this.db.user.findUnique({ where: { email: input.email } })

    if (!user || !user.passwordHash) {
      throw appErrors.authenticationRequired()
    }

    const passwordMatches = await argon2.verify(user.passwordHash, input.password)

    if (!passwordMatches || user.status !== 'ACTIVE') {
      throw appErrors.authenticationRequired()
    }

    return toSafeUser(user)
  }

  public async getById(id: string): Promise<SafeUser> {
    const user = await this.db.user.findUnique({ where: { id } })

    if (!user || user.status !== 'ACTIVE') {
      throw appErrors.authenticationRequired()
    }

    return toSafeUser(user)
  }
}
