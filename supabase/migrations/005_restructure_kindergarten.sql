-- Restructure Kindergarten: Alphabet first, then Vocabulary

-- Step 1: Push existing unit sort_orders up by 4
UPDATE curriculum_units
SET sort_order = sort_order + 4
WHERE level_id = (SELECT id FROM curriculum_levels WHERE slug = 'kindergarten');

-- Step 2: Rename existing alphabet units to vocabulary
UPDATE curriculum_units
SET slug = 'vocabulary-1', title = 'Vocabulary Part 1', description = 'Basic words: apple, cat, book'
WHERE slug = 'alphabet-1'
AND level_id = (SELECT id FROM curriculum_levels WHERE slug = 'kindergarten');

UPDATE curriculum_units
SET slug = 'vocabulary-2', title = 'Vocabulary Part 2', description = 'More everyday words and objects'
WHERE slug = 'alphabet-2'
AND level_id = (SELECT id FROM curriculum_levels WHERE slug = 'kindergarten');

UPDATE curriculum_units
SET slug = 'vocabulary-3', title = 'Vocabulary Part 3', description = 'Animals, food, and nature words'
WHERE slug = 'alphabet-3'
AND level_id = (SELECT id FROM curriculum_levels WHERE slug = 'kindergarten');

UPDATE curriculum_units
SET slug = 'vocabulary-4', title = 'Vocabulary Part 4', description = 'Family, home, and school words'
WHERE slug = 'alphabet-4'
AND level_id = (SELECT id FROM curriculum_levels WHERE slug = 'kindergarten');

-- Step 3: Create new Armenian Alphabet units (sort_order 1-4)
INSERT INTO curriculum_units (level_id, slug, title, description, sort_order)
SELECT l.id, u.slug, u.title, u.description, u.sort_order
FROM curriculum_levels l,
(VALUES
  ('armenian-alphabet-1', 'Armenian Alphabet Part 1', 'Letters 1-9 with sounds and recognition', 1),
  ('armenian-alphabet-2', 'Armenian Alphabet Part 2', 'Letters 10-18 with sounds and recognition', 2),
  ('armenian-alphabet-3', 'Armenian Alphabet Part 3', 'Letters 19-27 with sounds and recognition', 3),
  ('armenian-alphabet-4', 'Armenian Alphabet Part 4', 'Letters 28-36 and complete alphabet review', 4)
) AS u(slug, title, description, sort_order)
WHERE l.slug = 'kindergarten';

-- Step 4: Create lessons for each alphabet unit
-- Armenian Alphabet Part 1
INSERT INTO curriculum_lessons (unit_id, slug, title, description, lesson_type, sort_order, passing_score)
SELECT u.id, les.slug, les.title, les.description, les.lesson_type, les.sort_order, les.passing_score
FROM curriculum_units u,
(VALUES
  ('lesson-1', 'Lesson 1', 'Learn letters 1-3', 'practice', 1, 70),
  ('lesson-2', 'Lesson 2', 'Learn letters 4-6', 'practice', 2, 70),
  ('lesson-3', 'Lesson 3', 'Learn letters 7-9', 'practice', 3, 70),
  ('review', 'Review', 'Practice all letters from this unit', 'practice', 4, 70),
  ('quiz', 'Unit Quiz', 'Test your knowledge of letters 1-9', 'quiz', 5, 70)
) AS les(slug, title, description, lesson_type, sort_order, passing_score)
WHERE u.slug = 'armenian-alphabet-1';

-- Armenian Alphabet Part 2
INSERT INTO curriculum_lessons (unit_id, slug, title, description, lesson_type, sort_order, passing_score)
SELECT u.id, les.slug, les.title, les.description, les.lesson_type, les.sort_order, les.passing_score
FROM curriculum_units u,
(VALUES
  ('lesson-1', 'Lesson 1', 'Learn letters 10-12', 'practice', 1, 70),
  ('lesson-2', 'Lesson 2', 'Learn letters 13-15', 'practice', 2, 70),
  ('lesson-3', 'Lesson 3', 'Learn letters 16-18', 'practice', 3, 70),
  ('review', 'Review', 'Practice all letters from this unit', 'practice', 4, 70),
  ('quiz', 'Unit Quiz', 'Test your knowledge of letters 10-18', 'quiz', 5, 70)
) AS les(slug, title, description, lesson_type, sort_order, passing_score)
WHERE u.slug = 'armenian-alphabet-2';

-- Armenian Alphabet Part 3
INSERT INTO curriculum_lessons (unit_id, slug, title, description, lesson_type, sort_order, passing_score)
SELECT u.id, les.slug, les.title, les.description, les.lesson_type, les.sort_order, les.passing_score
FROM curriculum_units u,
(VALUES
  ('lesson-1', 'Lesson 1', 'Learn letters 19-21', 'practice', 1, 70),
  ('lesson-2', 'Lesson 2', 'Learn letters 22-24', 'practice', 2, 70),
  ('lesson-3', 'Lesson 3', 'Learn letters 25-27', 'practice', 3, 70),
  ('review', 'Review', 'Practice all letters from this unit', 'practice', 4, 70),
  ('quiz', 'Unit Quiz', 'Test your knowledge of letters 19-27', 'quiz', 5, 70)
) AS les(slug, title, description, lesson_type, sort_order, passing_score)
WHERE u.slug = 'armenian-alphabet-3';

-- Armenian Alphabet Part 4
INSERT INTO curriculum_lessons (unit_id, slug, title, description, lesson_type, sort_order, passing_score)
SELECT u.id, les.slug, les.title, les.description, les.lesson_type, les.sort_order, les.passing_score
FROM curriculum_units u,
(VALUES
  ('lesson-1', 'Lesson 1', 'Learn letters 28-30', 'practice', 1, 70),
  ('lesson-2', 'Lesson 2', 'Learn letters 31-33', 'practice', 2, 70),
  ('lesson-3', 'Lesson 3', 'Learn letters 34-36 and review', 'practice', 3, 70),
  ('review', 'Review', 'Complete alphabet review', 'practice', 4, 70),
  ('quiz', 'Unit Quiz', 'Test your knowledge of the full alphabet', 'quiz', 5, 70)
) AS les(slug, title, description, lesson_type, sort_order, passing_score)
WHERE u.slug = 'armenian-alphabet-4';
