import { PrismaClient, PromotionType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Tạo mã khuyến mãi mẫu để test trang /booking và checkout.
 * Chạy: npx ts-node src/database/seeders/promotion_seed.ts
 */
export async function seedPromotions() {
  const now = new Date();
  const end = new Date(now);
  end.setFullYear(end.getFullYear() + 1);

  await prisma.promotion.upsert({
    where: { code: 'WELCOME10' },
    create: {
      code: 'WELCOME10',
      sponsor_type: 'PLATFORM',
      discount_type: PromotionType.PERCENTAGE,
      discount_value: 10,
      min_order_value: 100000,
      max_discount_amount: 500000,
      start_date: now,
      end_date: end,
      usage_limit: 1000,
      is_active: true,
    },
    update: {
      is_active: true,
      end_date: end,
    },
  });

  console.log('Seeded promotion WELCOME10 (giảm 10%, tối đa 500k)');
}

if (require.main === module) {
  seedPromotions()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
