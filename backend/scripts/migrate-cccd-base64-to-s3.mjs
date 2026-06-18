/**
 * Migrate ảnh CCCD legacy (base64 trong DB) → Amazon S3 private.
 * Chạy một lần: npm run migrate:cccd-s3
 *
 * Yêu cầu: backend/.env có DATABASE_URL + AWS_* đã cấu hình.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const prisma = new PrismaClient();

const bucket = process.env.AWS_S3_BUCKET?.trim();
const prefix = (process.env.AWS_S3_KYC_PREFIX || 'kyc').trim().replace(/\/$/, '');
const region = process.env.AWS_REGION?.trim() || 'ap-southeast-1';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();

if (!bucket || !accessKeyId || !secretAccessKey) {
  console.error('Thiếu AWS_S3_BUCKET / AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY trong .env');
  process.exit(1);
}

const s3 = new S3Client({
  region,
  credentials: { accessKeyId, secretAccessKey },
});

function parseDataUrl(dataUrl) {
  const match = /^data:([^;]+);base64,([\s\S]+)$/.exec(dataUrl.trim());
  if (!match) return null;
  try {
    return {
      mimeType: match[1],
      buffer: Buffer.from(match[2], 'base64'),
    };
  } catch {
    return null;
  }
}

function extensionFromMime(mimeType) {
  if (mimeType.includes('png')) return 'png';
  if (mimeType.includes('webp')) return 'webp';
  return 'jpg';
}

function buildKey(userId, side, mimeType) {
  const ext = extensionFromMime(mimeType);
  return `${prefix}/${userId}/${side}.${ext}`;
}

function isLegacyBase64(value) {
  return typeof value === 'string' && value.startsWith('data:');
}

async function uploadFromDataUrl(userId, side, dataUrl) {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed?.buffer?.length) {
    throw new Error(`Không decode được base64 (${side})`);
  }

  const key = buildKey(userId, side, parsed.mimeType);

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: parsed.buffer,
      ContentType: parsed.mimeType,
      ServerSideEncryption: 'AES256',
      Metadata: {
        purpose: 'ekyc-cccd',
        userId,
        side,
        migratedFrom: 'db-base64',
      },
    }),
  );

  return key;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  if (dryRun) {
    console.log('Chế độ --dry-run: không ghi S3 / DB\n');
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { cccd_front: { startsWith: 'data:' } },
        { cccd_back: { startsWith: 'data:' } },
      ],
    },
    select: {
      id: true,
      email: true,
      full_name: true,
      cccd_front: true,
      cccd_back: true,
      cccd_number: true,
    },
  });

  console.log(`Tìm thấy ${users.length} user có ảnh CCCD base64 trong DB.\n`);

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const user of users) {
    const label = user.email || user.id;
    const updates = {};

    try {
      if (isLegacyBase64(user.cccd_front)) {
        if (dryRun) {
          console.log(`[dry-run] ${label}: sẽ migrate cccd_front`);
          updates.cccd_front = buildKey(user.id, 'front', 'image/jpeg');
        } else {
          updates.cccd_front = await uploadFromDataUrl(user.id, 'front', user.cccd_front);
          console.log(`✓ ${label}: front → ${updates.cccd_front}`);
        }
      }

      if (isLegacyBase64(user.cccd_back)) {
        if (dryRun) {
          console.log(`[dry-run] ${label}: sẽ migrate cccd_back`);
          updates.cccd_back = buildKey(user.id, 'back', 'image/jpeg');
        } else {
          updates.cccd_back = await uploadFromDataUrl(user.id, 'back', user.cccd_back);
          console.log(`✓ ${label}: back → ${updates.cccd_back}`);
        }
      }

      if (!Object.keys(updates).length) {
        skipped++;
        continue;
      }

      if (!dryRun) {
        await prisma.user.update({
          where: { id: user.id },
          data: updates,
        });
      }

      migrated++;
    } catch (err) {
      failed++;
      console.error(`✗ ${label}:`, err.message || err);
    }
  }

  console.log('\n--- Kết quả ---');
  console.log(`Đã migrate: ${migrated}`);
  console.log(`Bỏ qua:     ${skipped}`);
  console.log(`Lỗi:        ${failed}`);

  if (!dryRun && migrated > 0) {
    const remaining = await prisma.user.count({
      where: {
        OR: [
          { cccd_front: { startsWith: 'data:' } },
          { cccd_back: { startsWith: 'data:' } },
        ],
      },
    });
    console.log(`Còn base64 trong DB: ${remaining}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
