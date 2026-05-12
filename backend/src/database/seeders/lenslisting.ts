import {
  PrismaClient,
  ApprovalStatus,
  DepositType,
  Prisma
} from '@prisma/client'

const prisma = new PrismaClient()

export async function seedLensListings() {

  console.log('🌱 Start seeding lens listings...')

  // OWNER
  const owners = await prisma.user.findMany({
    where: {
      role: 'OWNER'
    }
  })

  // CATEGORY
  const categories = await prisma.category.findMany()

  if (owners.length === 0 || categories.length === 0) {

    console.log('❌ Missing owners or categories')
    return
  }

  // Helper tìm category
  const getCategoryId = (name: string) => {
    return categories.find(c => c.name === name)?.id
  }

  const listings: Prisma.LensListingCreateManyInput[] = [

    // =========================
    // SONY
    // =========================

    {
      owner_id: owners[0].id,
      title: 'Sony A7III Body Fullbox',
      description:
        'Máy đẹp 98%, quay chụp ổn định, hỗ trợ quay 4K. Phù hợp chụp event, du lịch, wedding.',

      quantity: 2,

      brand: 'Sony',

      category_id: getCategoryId('Máy ảnh'),

      approval_status: ApprovalStatus.APPROVED,

      city: 'Hồ Chí Minh',
      district: 'Thủ Đức',
      ward: 'Linh Trung',

      price_per_day: 650000,

      thumbnail:
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32',

      rating_avg: 4.9,

      review_count: 24,

      available: true,

      is_deleted: false,

      allowed_deposit_types: [
        DepositType.MONEY_PLATFORM,
        DepositType.PAPERWORK
      ],

      required_deposit_amount: 5000000
    },

    {
      owner_id: owners[1].id,

      title: 'Sony 24-70mm F2.8 GM',

      description:
        'Lens quốc dân cho wedding và event. Kính đẹp, nét tốt, AF nhanh.',

      quantity: 3,

      brand: 'Sony',

      category_id: getCategoryId('Ống kính'),

      approval_status: ApprovalStatus.APPROVED,

      city: 'Hồ Chí Minh',
      district: 'Bình Thạnh',
      ward: '25',

      price_per_day: 450000,

      thumbnail:
        'https://images.unsplash.com/photo-1516724562728-afc824a36e84',

      rating_avg: 5,

      review_count: 31,

      available: true,

      is_deleted: false,

      allowed_deposit_types: [
        DepositType.MONEY_PLATFORM
      ],

      required_deposit_amount: 4000000
    },

    // =========================
    // CANON
    // =========================

    {
      owner_id: owners[2].id,

      title: 'Canon EOS R6',

      description:
        'Body quay phim chống rung tốt, hỗ trợ livestream và wedding.',

      quantity: 2,

      brand: 'Canon',

      category_id: getCategoryId('Máy ảnh'),

      approval_status: ApprovalStatus.APPROVED,

      city: 'Hồ Chí Minh',
      district: 'Quận 7',
      ward: 'Tân Phong',

      price_per_day: 700000,

      thumbnail:
        'https://images.unsplash.com/photo-1502920917128-1aa500764cbd',

      rating_avg: 4.8,

      review_count: 17,

      available: true,

      is_deleted: false,

      allowed_deposit_types: [
        DepositType.MONEY_PLATFORM,
        DepositType.MONEY_DIRECT
      ],

      required_deposit_amount: 6000000
    },

    // =========================
    // SIGMA
    // =========================

    {
      owner_id: owners[3].id,

      title: 'Sigma 35mm F1.4 Art Sony E',

      description:
        'Lens chân dung xóa phông đẹp, cực nét, phù hợp chụp concept.',

      quantity: 2,

      brand: 'Sigma',

      category_id: getCategoryId('Ống kính'),

      approval_status: ApprovalStatus.APPROVED,

      city: 'Hồ Chí Minh',
      district: 'Gò Vấp',
      ward: '1',

      price_per_day: 300000,

      thumbnail:
        'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39',

      rating_avg: 4.7,

      review_count: 11,

      available: true,

      is_deleted: false,

      allowed_deposit_types: [
        DepositType.PAPERWORK
      ],

      required_deposit_amount: 3000000
    },

    // =========================
    // DJI
    // =========================

    {
      owner_id: owners[4].id,

      title: 'DJI RS3 Combo',

      description:
        'Gimbal chống rung cho mirrorless và cinema camera.',

      quantity: 2,

      brand: 'DJI',

      category_id: getCategoryId('Gimbal'),

      approval_status: ApprovalStatus.APPROVED,

      city: 'Hồ Chí Minh',
      district: 'Tân Bình',
      ward: '2',

      price_per_day: 350000,

      thumbnail:
        'https://images.unsplash.com/photo-1529078155058-5d716f45d604',

      rating_avg: 4.9,

      review_count: 8,

      available: true,

      is_deleted: false,

      allowed_deposit_types: [
        DepositType.MONEY_PLATFORM
      ],

      required_deposit_amount: 3500000
    },

    {
      owner_id: owners[5].id,

      title: 'DJI Mini 4 Pro Flycam',

      description:
        'Flycam quay 4K HDR, pin tốt, dễ mang đi du lịch.',

      quantity: 1,

      brand: 'DJI',

      category_id: getCategoryId('Flycam'),

      approval_status: ApprovalStatus.APPROVED,

      city: 'Hồ Chí Minh',
      district: 'Phú Nhuận',
      ward: '7',

      price_per_day: 900000,

      thumbnail:
        'https://images.unsplash.com/photo-1473968512647-3e447244af8f',

      rating_avg: 5,

      review_count: 15,

      available: true,

      is_deleted: false,

      allowed_deposit_types: [
        DepositType.MONEY_PLATFORM,
        DepositType.PAPERWORK
      ],

      required_deposit_amount: 8000000
    }
  ]

  await prisma.lensListing.createMany({
    data: listings,
    skipDuplicates: true
  })

  console.log(`Seeded ${listings.length} lens listings successfully!`)
}