-- ============================================================
-- Migration: Pivot to "מה עושים היום"
-- Run this in the Supabase SQL Editor (once, in order).
-- Safe to run on a live DB — all changes are additive.
-- ============================================================

-- 1. CONTENT TYPE
--    'attraction' | 'restaurant' | 'event'
--    All existing rows get 'attraction' automatically.
ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'attraction';

ALTER TABLE activities
  ADD CONSTRAINT activities_type_check
  CHECK (type IN ('attraction', 'restaurant', 'event'));

-- 2. PUBLICATION STATUS
--    Existing content is already live → 'published'.
--    New user/business submissions start as 'pending' until admin approves.
ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published';

ALTER TABLE activities
  ADD CONSTRAINT activities_status_check
  CHECK (status IN ('published', 'pending', 'rejected'));

-- Change the column default for future inserts so unreviewed submissions
-- are never accidentally published.
ALTER TABLE activities
  ALTER COLUMN status SET DEFAULT 'pending';

-- 3. OCCASION TAGS
--    Array of strings: 'couple' | 'family' | 'kids' | 'friends'
--    Existing rows get an empty array (no tag = appears in "הכל").
ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS occasion_tags text[] NOT NULL DEFAULT '{}';

-- 4. PRICE LEVEL  (optional, 1=₪  2=₪₪  3=₪₪₪)
ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS price_level integer;

ALTER TABLE activities
  ADD CONSTRAINT activities_price_level_check
  CHECK (price_level IS NULL OR price_level BETWEEN 1 AND 3);

-- 5. CONTACT / WEB
ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS website_url text;

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS phone text;

-- 6. EVENT DATE RANGE  (only relevant when type = 'event')
ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS event_start timestamptz;

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS event_end timestamptz;

-- 7. INDEXES for the most common query patterns
--    (type + status is the primary feed query)
CREATE INDEX IF NOT EXISTS idx_activities_type
  ON activities (type);

CREATE INDEX IF NOT EXISTS idx_activities_status
  ON activities (status);

CREATE INDEX IF NOT EXISTS idx_activities_type_status
  ON activities (type, status);

CREATE INDEX IF NOT EXISTS idx_activities_event_start
  ON activities (event_start)
  WHERE type = 'event';

-- ============================================================
-- Verification — run this after the migration to confirm:
-- ============================================================
-- SELECT
--   COUNT(*) FILTER (WHERE type = 'attraction')  AS attractions,
--   COUNT(*) FILTER (WHERE status = 'published') AS published,
--   COUNT(*) FILTER (WHERE status = 'pending')   AS pending
-- FROM activities;
