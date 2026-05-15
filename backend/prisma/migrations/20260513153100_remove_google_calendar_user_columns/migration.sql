-- Remove Google Calendar OAuth columns (LensLease handles availability only).
ALTER TABLE "users" DROP COLUMN IF EXISTS "google_calendar_refresh_token";
ALTER TABLE "users" DROP COLUMN IF EXISTS "google_calendar_id";
