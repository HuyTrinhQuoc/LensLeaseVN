/**
 * Seed: user OWNER + ví + 1 lens_listing (APPROVED) để test luồng ký quỹ.
 * Chạy: node scripts/seed-owner-deposit-test.mjs
 * Dùng DATABASE_URL từ backend/.env
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const OWNER_ID = '6317344c-7fb6-4999-b2df-c31ce5f46545';
const OWNER_EMAIL = `${OWNER_ID}@owner.seed.lenslease`;

/** Thêm ảnh gallery (lens_images) nếu listing chưa có đủ. */
async function ensureLensGallery(lensId) {
  const n = await prisma.lensImage.count({ where: { lens_id: lensId } });
  if (n >= 2) {
    console.log('[seed] lens_images đã có (>=2), giữ nguyên:', lensId);
    return;
  }
  const urls = [
    'https://placehold.co/800x600/2a2a40/eee?text=A7IV+Mat+truoc',
    'https://placehold.co/800x600/2a2a40/eee?text=A7IV+Mat+sau',
  ];
  const toCreate = urls.slice(n);
  if (toCreate.length === 0) return;
  await prisma.lensImage.createMany({
    data: toCreate.map((image_url) => ({ lens_id: lensId, image_url })),
  });
  console.log('[seed] Đã thêm', toCreate.length, 'ảnh lens_images cho', lensId);
}

async function main() {
  const lensAsPk = await prisma.lensListing.findUnique({
    where: { id: OWNER_ID },
    select: { id: true, title: true, owner_id: true },
  });
  if (lensAsPk) {
    console.warn(
      '[seed] Cảnh báo: UUID này hiện là id của lens_listings (sản phẩm), không phải users:',
      lensAsPk,
    );
    console.warn(
      '[seed] Vẫn tạo user cùng UUID trong bảng users (Postgres cho phép PK trùng giá trị giữa các bảng).',
    );
  }

  const user = await prisma.user.upsert({
    where: { id: OWNER_ID },
    create: {
      id: OWNER_ID,
      email: OWNER_EMAIL,
      full_name: 'Chủ máy test (ký quỹ)',
      role: 'OWNER',
      status: 'ACTIVE',
      is_deleted: false,
      auth_provider: 'LOCAL',
    },
    update: {
      role: 'OWNER',
      status: 'ACTIVE',
      is_deleted: false,
      full_name: 'Chủ máy test (ký quỹ)',
    },
  });
  console.log('[seed] User:', { id: user.id, email: user.email, role: user.role });

  await prisma.wallet.upsert({
    where: { user_id: OWNER_ID },
    create: {
      user_id: OWNER_ID,
      available_balance: 5_000_000,
      pending_balance: 0,
    },
    update: {
      available_balance: 5_000_000,
      pending_balance: 0,
    },
  });
  console.log('[seed] Wallet upsert OK (available ~ 5.000.000 VND)');

  let category = await prisma.category.findFirst({ orderBy: { created_at: 'asc' } });
  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'Máy ảnh',
        description: 'Danh mục seed',
      },
    });
    console.log('[seed] Created category:', category.id);
  }

  const existingListing = await prisma.lensListing.findFirst({
    where: { owner_id: OWNER_ID, is_deleted: false },
    orderBy: { created_at: 'desc' },
  });

  if (existingListing) {
    const updated = await prisma.lensListing.update({
      where: { id: existingListing.id },
      data: {
        approval_status: 'APPROVED',
        available: true,
        is_deleted: false,
        required_deposit_amount: 3_000_000,
        allowed_deposit_types: ['MONEY_PLATFORM'],
      },
    });
    console.log('[seed] Đã cập nhật listing có sẵn:', updated.id, updated.title);
    await ensureLensGallery(updated.id);
    return;
  }

  const listing = await prisma.lensListing.create({
    data: {
      owner_id: OWNER_ID,
      title: 'Sony Alpha A7 IV — bài test ký quỹ',
      description: 'Sản phẩm seed để test ví / cọc nền tảng.',
      quantity: 2,
      brand: 'Sony',
      category_id: category.id,
      approval_status: 'APPROVED',
      city: 'Thành phố Hồ Chí Minh',
      district: 'Quận 1',
      price_per_day: 350_000,
      available: true,
      is_deleted: false,
      required_deposit_amount: 3_000_000,
      allowed_deposit_types: ['MONEY_PLATFORM'],
      thumbnail: 'https://placehold.co/600x400/1a1a2e/fff?text=LensLease+Test',
    },
  });
  console.log('[seed] Đã tạo lens_listing:', listing.id, listing.title);
  await ensureLensGallery(listing.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
