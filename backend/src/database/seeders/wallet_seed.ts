import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedWallets() {

  console.log('Start seeding wallets...')

  // Lấy toàn bộ users
  const users = await prisma.user.findMany()

  if (users.length === 0) {
    console.log('No users found!')
    return
  }

  const wallets: Prisma.WalletCreateManyInput[] = []

  for (const user of users) {

    let availableBalance = 0
    let pendingBalance = 0

    // ADMIN
    if (user.role === 'ADMIN') {

      availableBalance = 50000000
      pendingBalance = 10000000
    }

    // OWNER
    else if (user.role === 'OWNER') {

      availableBalance = Math.floor(
        Math.random() * (30000000 - 5000000) + 5000000
      )

      pendingBalance = Math.floor(
        Math.random() * (10000000 - 1000000) + 1000000
      )
    }

    // USER
    else {

      availableBalance = Math.floor(
        Math.random() * (5000000 - 100000) + 100000
      )

      pendingBalance = 0
    }

    wallets.push({
      user_id: user.id,

      available_balance: availableBalance,

      pending_balance: pendingBalance
    })
  }

  await prisma.wallet.createMany({
    data: wallets,
    skipDuplicates: true
  })

  console.log(`Seeded ${wallets.length} wallets successfully!`)
}