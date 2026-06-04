-- AlterTable
ALTER TABLE "booking_payout_allocations" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "lens_listings" ADD COLUMN     "market_value" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "payouts" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "cccd_back" TEXT,
ADD COLUMN     "cccd_front" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "kyc_status" "ApprovalStatus",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
