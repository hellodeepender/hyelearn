-- Add locale column to curriculum tables for multi-language support

-- Add locale to curriculum_levels (the canonical location)
ALTER TABLE curriculum_levels ADD COLUMN IF NOT EXISTS locale TEXT NOT NULL DEFAULT 'hy';

-- Add locale to curriculum_units (denormalized for query convenience)
ALTER TABLE curriculum_units ADD COLUMN IF NOT EXISTS locale TEXT NOT NULL DEFAULT 'hy';

-- Add locale to curriculum_lessons (denormalized for query convenience)
ALTER TABLE curriculum_lessons ADD COLUMN IF NOT EXISTS locale TEXT NOT NULL DEFAULT 'hy';

-- Backfill: all existing levels/units/lessons default to 'hy' (Armenian)
-- which is handled by the DEFAULT above

-- Index for locale filtering
CREATE INDEX IF NOT EXISTS idx_levels_locale ON curriculum_levels(locale);
CREATE INDEX IF NOT EXISTS idx_units_locale ON curriculum_units(locale);
CREATE INDEX IF NOT EXISTS idx_lessons_locale ON curriculum_lessons(locale);
