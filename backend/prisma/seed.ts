import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  const user = await prisma.user.upsert({
    where: { email: 'demo@whismap.local' },
    update: {},
    create: {
      email: 'demo@whismap.local',
      displayName: 'Demo caregiver',
      // This seed does not create a usable password. Create real accounts via the auth route.
      passwordHash: null
    }
  })

  await prisma.household.upsert({
    where: { id: 'demo-household' },
    update: {},
    create: {
      id: 'demo-household',
      name: 'Demo household',
      ownerId: user.id,
      members: {
        create: { userId: user.id, role: 'OWNER' }
      }
    }
  })

  console.log('Seeded non-production demo records.')
}

main()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
