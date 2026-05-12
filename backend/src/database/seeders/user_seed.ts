import {
  PrismaClient,
  Role,
  AccountStatus,
  AuthProvider,
  Prisma
} from '@prisma/client'

import { fakerVI as faker } from '@faker-js/faker'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export async function seedUsers() {

  console.log('Start seeding users...')

  // password chung: 123456
  const hashedPassword = await bcrypt.hash('123456', 10)

  const users: Prisma.UserCreateManyInput[] = []

  // =========================
  // 1 ADMIN
  // =========================

  users.push({
    email: 'admin@lenshub.vn',
    password_hash: hashedPassword,
    full_name: 'Trịnh Quốc Huy',
    phone: '0908123001',
    address: 'Quận 1, Hồ Chí Minh',
    role: Role.ADMIN,
    status: AccountStatus.ACTIVE,
    is_deleted: false,
    auth_provider: AuthProvider.LOCAL,
    provider_id: null,
    rating_avg: 5
  })

  // =========================
  // 15 OWNER
  // =========================

  for (let i = 1; i <= 15; i++) {

    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()

    users.push({
      email: `owner${i}@gmail.com`,
      password_hash: hashedPassword,

      full_name: `${lastName} ${firstName}`,

      phone: `09${faker.string.numeric(8)}`,

      address: faker.helpers.arrayElement([
        'Thủ Đức, Hồ Chí Minh',
        'Gò Vấp, Hồ Chí Minh',
        'Bình Thạnh, Hồ Chí Minh',
        'Quận 1, Hồ Chí Minh',
        'Quận 7, Hồ Chí Minh',
        'Tân Bình, Hồ Chí Minh'
      ]),

      role: Role.OWNER,

      status: faker.helpers.arrayElement([
        AccountStatus.ACTIVE,
        AccountStatus.ACTIVE,
        AccountStatus.ACTIVE,
        AccountStatus.LOCKED
      ]),

      is_deleted: false,

      auth_provider: AuthProvider.LOCAL,

      provider_id: null,

      rating_avg: faker.number.float({
        min: 4,
        max: 5,
        fractionDigits: 1
      })
    })
  }

  // =========================
  // 14 USER
  // =========================

  for (let i = 1; i <= 14; i++) {

    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()

    users.push({
      email: `user${i}@gmail.com`,
      password_hash: hashedPassword,

      full_name: `${lastName} ${firstName}`,

      phone: `09${faker.string.numeric(8)}`,

      address: faker.helpers.arrayElement([
        'Thủ Đức, Hồ Chí Minh',
        'Bình Tân, Hồ Chí Minh',
        'Phú Nhuận, Hồ Chí Minh',
        'Quận 3, Hồ Chí Minh',
        'Quận 10, Hồ Chí Minh',
        'Nhà Bè, Hồ Chí Minh'
      ]),

      role: Role.USER,

      status: faker.helpers.arrayElement([
        AccountStatus.ACTIVE,
        AccountStatus.ACTIVE,
        AccountStatus.ACTIVE,
        AccountStatus.LOCKED
      ]),

      is_deleted: false,

      auth_provider: AuthProvider.LOCAL,

      provider_id: null,

      rating_avg: faker.number.float({
        min: 3.5,
        max: 5,
        fractionDigits: 1
      })
    })
  }

  // =========================
  // INSERT DATABASE
  // =========================

  await prisma.user.createMany({
    data: users,
    skipDuplicates: true
  })

  console.log('✅ Seeded 30 users successfully!')
}