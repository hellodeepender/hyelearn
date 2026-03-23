-- Run in Supabase SQL Editor manually
-- Step 1: Find duplicates
-- SELECT student_id, badge_slug, COUNT(*)
-- FROM student_badges
-- GROUP BY student_id, badge_slug
-- HAVING COUNT(*) > 1;

-- Step 2: Delete duplicates, keeping the earliest
DELETE FROM student_badges a USING student_badges b
WHERE a.id > b.id AND a.student_id = b.student_id AND a.badge_slug = b.badge_slug;

-- Step 3: The UNIQUE(student_id, badge_slug) constraint already exists from
-- migration 012_rewards_system.sql. If for some reason it was dropped, re-add:
-- ALTER TABLE student_badges ADD CONSTRAINT unique_student_badge UNIQUE (student_id, badge_slug);
