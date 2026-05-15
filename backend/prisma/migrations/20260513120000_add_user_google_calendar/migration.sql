-- AlterTable
ALTER TABLE "users" ADD COLUMN "google_calendar_refresh_token" TEXT;
ALTER TABLE "users" ADD COLUMN "google_calendar_id" VARCHAR(512);
