-- RLS for public lens listings: only APPROVED + available are readable by default.
-- Owners (authenticated via Supabase JWT sub) can read their own listings at any status.

ALTER TABLE lens_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_approved_listings"
  ON lens_listings FOR SELECT
  USING (
    approval_status = 'APPROVED'
    AND available = true
    AND is_deleted = false
  );

CREATE POLICY "owners_read_own_listings"
  ON lens_listings FOR SELECT
  TO authenticated
  USING (
    auth.uid()::uuid = owner_id
  );
