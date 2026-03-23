-- Allow 'ar' locale in Sunday School tables
-- The existing check constraint only allows 'hy' and 'el'

-- Drop and recreate the constraint to include 'ar'
ALTER TABLE sunday_units DROP CONSTRAINT IF EXISTS sunday_units_locale_check;
ALTER TABLE sunday_units ADD CONSTRAINT sunday_units_locale_check CHECK (locale IN ('hy', 'el', 'ar'));

ALTER TABLE sunday_lessons DROP CONSTRAINT IF EXISTS sunday_lessons_locale_check;
ALTER TABLE sunday_lessons ADD CONSTRAINT sunday_lessons_locale_check CHECK (locale IN ('hy', 'el', 'ar'));
