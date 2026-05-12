import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedCategories() {

  console.log('Seeding categories...')

  const categories = [
    {
      name: 'Máy ảnh',
      description: 'Các dòng máy ảnh DSLR, Mirrorless, Compact chuyên chụp ảnh và quay phim'
    },

    {
      name: 'Ống kính',
      description: 'Lens góc rộng, tele, chân dung, macro và lens cine'
    },

    {
      name: 'Flycam',
      description: 'Drone quay phim chụp ảnh trên không chuyên nghiệp'
    },

    {
      name: 'Gimbal',
      description: 'Thiết bị chống rung cho máy ảnh và điện thoại'
    },

    {
      name: 'Đèn',
      description: 'Đèn studio, đèn RGB, flash và thiết bị hỗ trợ ánh sáng'
    },

    {
      name: 'Micro',
      description: 'Micro thu âm, mic wireless, shotgun mic và audio recorder'
    },

    {
      name: 'Tripod',
      description: 'Chân máy ảnh, monopod và tripod quay phim'
    },

    {
      name: 'Phụ kiện',
      description: 'Pin, thẻ nhớ, túi máy ảnh, cage, monitor và phụ kiện khác'
    }
  ]

  await prisma.category.createMany({
    data: categories,
    skipDuplicates: true
  })

  console.log('Categories seeded!')
}