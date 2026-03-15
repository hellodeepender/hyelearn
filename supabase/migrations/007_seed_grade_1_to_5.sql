-- Ensure Grade 1-5 levels exist (Kindergarten is sort_order 0, seeded in 002)
INSERT INTO curriculum_levels (slug, title, description, grade_value, sort_order) VALUES
('grade-1', 'Grade 1', 'Building reading skills, expanding vocabulary, simple sentences', '1', 1),
('grade-2', 'Grade 2', 'Reading comprehension, grammar basics, cultural awareness', '2', 2),
('grade-3', 'Grade 3', 'Intermediate vocabulary, verb conjugation, Armenian history', '3', 3),
('grade-4', 'Grade 4', 'Advanced reading, complex grammar, Armenian literature', '4', 4),
('grade-5', 'Grade 5', 'Composition skills, advanced grammar, cultural studies', '5', 5)
ON CONFLICT (slug) DO NOTHING;

-- ==============================
-- GRADE 1: Reading Basics, Everyday Words, Simple Sentences
-- ==============================

INSERT INTO curriculum_units (level_id, slug, title, description, sort_order)
SELECT l.id, u.slug, u.title, u.description, u.sort_order
FROM curriculum_levels l,
(VALUES
  ('reading-basics', 'Reading Basics', 'Learn basic reading skills with simple Armenian words', 1),
  ('everyday-words', 'Everyday Words', 'Build vocabulary for everyday conversations', 2),
  ('simple-sentences', 'Simple Sentences', 'Form simple sentences in Western Armenian', 3)
) AS u(slug, title, description, sort_order)
WHERE l.slug = 'grade-1'
ON CONFLICT (level_id, slug) DO NOTHING;

INSERT INTO curriculum_lessons (unit_id, slug, title, description, lesson_type, template_type, sort_order, passing_score)
SELECT u.id, les.slug, les.title, les.description, les.lesson_type, les.template_type, les.sort_order, 70
FROM curriculum_units u
JOIN curriculum_levels l ON u.level_id = l.id,
(VALUES
  ('lesson-1', 'Lesson 1', 'Learn new words', 'practice', 'vocabulary', 1),
  ('lesson-2', 'Lesson 2', 'More vocabulary', 'practice', 'vocabulary', 2),
  ('lesson-3', 'Lesson 3', 'Practice words', 'practice', 'vocabulary', 3),
  ('review', 'Review', 'Review all words from this unit', 'practice', 'review', 4),
  ('quiz', 'Unit Quiz', 'Test your knowledge', 'quiz', 'quiz', 5)
) AS les(slug, title, description, lesson_type, template_type, sort_order)
WHERE l.slug = 'grade-1'
ON CONFLICT (unit_id, slug) DO NOTHING;

-- ==============================
-- GRADE 2: same structure, different unit themes
-- ==============================

INSERT INTO curriculum_units (level_id, slug, title, description, sort_order)
SELECT l.id, u.slug, u.title, u.description, u.sort_order
FROM curriculum_levels l,
(VALUES
  ('reading-basics', 'Reading Basics', 'Strengthen reading with longer words and phrases', 1),
  ('everyday-words', 'Everyday Words', 'Expand vocabulary for home and school', 2),
  ('simple-sentences', 'Simple Sentences', 'Build longer sentences with adjectives and verbs', 3)
) AS u(slug, title, description, sort_order)
WHERE l.slug = 'grade-2'
ON CONFLICT (level_id, slug) DO NOTHING;

INSERT INTO curriculum_lessons (unit_id, slug, title, description, lesson_type, template_type, sort_order, passing_score)
SELECT u.id, les.slug, les.title, les.description, les.lesson_type, les.template_type, les.sort_order, 70
FROM curriculum_units u
JOIN curriculum_levels l ON u.level_id = l.id,
(VALUES
  ('lesson-1', 'Lesson 1', 'Learn new words', 'practice', 'vocabulary', 1),
  ('lesson-2', 'Lesson 2', 'More vocabulary', 'practice', 'vocabulary', 2),
  ('lesson-3', 'Lesson 3', 'Practice words', 'practice', 'vocabulary', 3),
  ('review', 'Review', 'Review all words from this unit', 'practice', 'review', 4),
  ('quiz', 'Unit Quiz', 'Test your knowledge', 'quiz', 'quiz', 5)
) AS les(slug, title, description, lesson_type, template_type, sort_order)
WHERE l.slug = 'grade-2'
ON CONFLICT (unit_id, slug) DO NOTHING;

-- ==============================
-- GRADE 3: Grammar Foundations, Reading Comprehension, Writing Practice
-- ==============================

INSERT INTO curriculum_units (level_id, slug, title, description, sort_order)
SELECT l.id, u.slug, u.title, u.description, u.sort_order
FROM curriculum_levels l,
(VALUES
  ('grammar-foundations', 'Grammar Foundations', 'Learn basic Armenian grammar rules and verb forms', 1),
  ('reading-comprehension', 'Reading Comprehension', 'Read short passages and answer questions', 2),
  ('writing-practice', 'Writing Practice', 'Practice writing simple paragraphs in Armenian', 3)
) AS u(slug, title, description, sort_order)
WHERE l.slug = 'grade-3'
ON CONFLICT (level_id, slug) DO NOTHING;

INSERT INTO curriculum_lessons (unit_id, slug, title, description, lesson_type, template_type, sort_order, passing_score)
SELECT u.id, les.slug, les.title, les.description, les.lesson_type, les.template_type, les.sort_order, 70
FROM curriculum_units u
JOIN curriculum_levels l ON u.level_id = l.id,
(VALUES
  ('lesson-1', 'Lesson 1', 'Learn new concepts', 'practice', 'vocabulary', 1),
  ('lesson-2', 'Lesson 2', 'Practice and apply', 'practice', 'vocabulary', 2),
  ('lesson-3', 'Lesson 3', 'Reinforce learning', 'practice', 'vocabulary', 3),
  ('review', 'Review', 'Review all content from this unit', 'practice', 'review', 4),
  ('quiz', 'Unit Quiz', 'Test your knowledge', 'quiz', 'quiz', 5)
) AS les(slug, title, description, lesson_type, template_type, sort_order)
WHERE l.slug = 'grade-3'
ON CONFLICT (unit_id, slug) DO NOTHING;

-- ==============================
-- GRADE 4: same unit slugs as Grade 3 but different level
-- ==============================

INSERT INTO curriculum_units (level_id, slug, title, description, sort_order)
SELECT l.id, u.slug, u.title, u.description, u.sort_order
FROM curriculum_levels l,
(VALUES
  ('grammar-foundations', 'Grammar Foundations', 'Advanced verb conjugation and sentence structure', 1),
  ('reading-comprehension', 'Reading Comprehension', 'Longer texts with comprehension questions', 2),
  ('writing-practice', 'Writing Practice', 'Write multi-paragraph compositions in Armenian', 3)
) AS u(slug, title, description, sort_order)
WHERE l.slug = 'grade-4'
ON CONFLICT (level_id, slug) DO NOTHING;

INSERT INTO curriculum_lessons (unit_id, slug, title, description, lesson_type, template_type, sort_order, passing_score)
SELECT u.id, les.slug, les.title, les.description, les.lesson_type, les.template_type, les.sort_order, 70
FROM curriculum_units u
JOIN curriculum_levels l ON u.level_id = l.id,
(VALUES
  ('lesson-1', 'Lesson 1', 'Learn new concepts', 'practice', 'vocabulary', 1),
  ('lesson-2', 'Lesson 2', 'Practice and apply', 'practice', 'vocabulary', 2),
  ('lesson-3', 'Lesson 3', 'Reinforce learning', 'practice', 'vocabulary', 3),
  ('review', 'Review', 'Review all content from this unit', 'practice', 'review', 4),
  ('quiz', 'Unit Quiz', 'Test your knowledge', 'quiz', 'quiz', 5)
) AS les(slug, title, description, lesson_type, template_type, sort_order)
WHERE l.slug = 'grade-4'
ON CONFLICT (unit_id, slug) DO NOTHING;

-- ==============================
-- GRADE 5: Armenian Literature, Advanced Grammar, Composition
-- ==============================

INSERT INTO curriculum_units (level_id, slug, title, description, sort_order)
SELECT l.id, u.slug, u.title, u.description, u.sort_order
FROM curriculum_levels l,
(VALUES
  ('armenian-literature', 'Armenian Literature', 'Read and discuss classic Armenian literary works', 1),
  ('advanced-grammar', 'Advanced Grammar', 'Master complex grammatical structures', 2),
  ('composition', 'Composition', 'Write essays and creative pieces in Armenian', 3)
) AS u(slug, title, description, sort_order)
WHERE l.slug = 'grade-5'
ON CONFLICT (level_id, slug) DO NOTHING;

INSERT INTO curriculum_lessons (unit_id, slug, title, description, lesson_type, template_type, sort_order, passing_score)
SELECT u.id, les.slug, les.title, les.description, les.lesson_type, les.template_type, les.sort_order, 70
FROM curriculum_units u
JOIN curriculum_levels l ON u.level_id = l.id,
(VALUES
  ('lesson-1', 'Lesson 1', 'Learn new concepts', 'practice', 'vocabulary', 1),
  ('lesson-2', 'Lesson 2', 'Practice and apply', 'practice', 'vocabulary', 2),
  ('lesson-3', 'Lesson 3', 'Reinforce learning', 'practice', 'vocabulary', 3),
  ('review', 'Review', 'Review all content from this unit', 'practice', 'review', 4),
  ('quiz', 'Unit Quiz', 'Test your knowledge', 'quiz', 'quiz', 5)
) AS les(slug, title, description, lesson_type, template_type, sort_order)
WHERE l.slug = 'grade-5'
ON CONFLICT (unit_id, slug) DO NOTHING;
