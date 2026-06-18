-- Bàn giao thiết bị + cờ người thuê đã trả máy (đồng bộ schema.prisma)
-- Dùng IF NOT EXISTS để an toàn khi DB đã được `db push` trước đó.

ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "renter_returned" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "handover_report" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "note_checkin" TEXT,
    "images_checkin" TEXT[],
    "signature_a" TEXT,
    "signature_b" TEXT,
    "note_checkout" TEXT,
    "images_checkout" TEXT[],
    "is_damaged" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "handover_report_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "handover_report_booking_id_key" ON "handover_report"("booking_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'handover_report_booking_id_fkey'
  ) THEN
    ALTER TABLE "handover_report"
      ADD CONSTRAINT "handover_report_booking_id_fkey"
      FOREIGN KEY ("booking_id") REFERENCES "bookings"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
