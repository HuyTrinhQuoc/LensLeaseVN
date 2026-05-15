-- Marketplace: sổ cái ví, phân bổ doanh thu booking, lệnh rút tiền owner

-- CreateEnum
CREATE TYPE "WalletBalanceBucket" AS ENUM ('AVAILABLE', 'PENDING');

-- CreateEnum
CREATE TYPE "WalletLedgerDirection" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "BookingPayoutAllocationStatus" AS ENUM ('PENDING', 'AVAILABLE', 'PAID');

-- CreateEnum
CREATE TYPE "PayoutRequestStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED');

-- CreateTable
CREATE TABLE "booking_payout_allocations" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "gross_amount" DECIMAL(12,2) NOT NULL,
    "platform_fee" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(12,2) NOT NULL,
    "status" "BookingPayoutAllocationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_payout_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "wallet_id" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "PayoutRequestStatus" NOT NULL DEFAULT 'PENDING',
    "bank_name" VARCHAR(255),
    "bank_account" VARCHAR(100),
    "bank_owner_name" VARCHAR(255),
    "admin_note" TEXT,
    "rejection_reason" TEXT,
    "processed_at" TIMESTAMP(6),
    "processed_by_id" UUID,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" UUID NOT NULL,
    "wallet_id" UUID NOT NULL,
    "booking_id" UUID,
    "booking_group_id" UUID,
    "reference_transaction_id" UUID,
    "payout_id" UUID,
    "bucket" "WalletBalanceBucket" NOT NULL,
    "direction" "WalletLedgerDirection" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "available_before" DECIMAL(12,2) NOT NULL,
    "available_after" DECIMAL(12,2) NOT NULL,
    "pending_before" DECIMAL(12,2) NOT NULL,
    "pending_after" DECIMAL(12,2) NOT NULL,
    "note" TEXT,
    "idempotency_key" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "booking_payout_allocations_booking_id_key" ON "booking_payout_allocations"("booking_id");

CREATE INDEX "booking_payout_allocations_owner_id_status_idx" ON "booking_payout_allocations"("owner_id", "status");

CREATE INDEX "payouts_owner_id_status_idx" ON "payouts"("owner_id", "status");

CREATE INDEX "payouts_wallet_id_status_idx" ON "payouts"("wallet_id", "status");

CREATE UNIQUE INDEX "wallet_transactions_idempotency_key_key" ON "wallet_transactions"("idempotency_key");

CREATE INDEX "wallet_transactions_wallet_id_created_at_idx" ON "wallet_transactions"("wallet_id", "created_at");

CREATE INDEX "wallet_transactions_booking_id_idx" ON "wallet_transactions"("booking_id");

CREATE INDEX "wallet_transactions_payout_id_idx" ON "wallet_transactions"("payout_id");

-- AddForeignKey
ALTER TABLE "booking_payout_allocations" ADD CONSTRAINT "booking_payout_allocations_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "booking_payout_allocations" ADD CONSTRAINT "booking_payout_allocations_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payouts" ADD CONSTRAINT "payouts_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payouts" ADD CONSTRAINT "payouts_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payouts" ADD CONSTRAINT "payouts_processed_by_id_fkey" FOREIGN KEY ("processed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_booking_group_id_fkey" FOREIGN KEY ("booking_group_id") REFERENCES "booking_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_reference_transaction_id_fkey" FOREIGN KEY ("reference_transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_payout_id_fkey" FOREIGN KEY ("payout_id") REFERENCES "payouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
