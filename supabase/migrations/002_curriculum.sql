-- Curriculum levels (maps to grades)
CREATE TABLE curriculum_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  grade_value TEXT NOT NULL,
  sort_order INT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Curriculum units (chapters within a level)
CREATE TABLE curriculum_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level_id UUID REFERENCES curriculum_levels(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(level_id, slug)
);

-- Curriculum lessons (individual lessons within a unit)
CREATE TABLE curriculum_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID REFERENCES curriculum_units(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  lesson_type TEXT NOT NULL DEFAULT 'practice',
  sort_order INT NOT NULL,
  passing_score INT DEFAULT 70,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(unit_id, slug)
);

-- Curated exercises (reviewed content within lessons)
CREATE TABLE curated_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES curriculum_lessons(id) ON DELETE CASCADE,
  exercise_type TEXT NOT NULL,
  exercise_data JSONB NOT NULL,
  sort_order INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES profiles(id),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Student progress through curriculum
CREATE TABLE student_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES curriculum_lessons(id) ON DELETE CASCADE,
  score INT,
  total INT,
  passed BOOLEAN DEFAULT false,
  attempts INT DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, lesson_id)
);

-- Certificates
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  level_id UUID REFERENCES curriculum_levels(id),
  student_name TEXT NOT NULL,
  level_title TEXT NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, level_id)
);

-- Exercise reviews / teacher feedback
CREATE TABLE exercise_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exercise_id UUID REFERENCES curated_exercises(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id),
  original_data JSONB NOT NULL,
  corrected_data JSONB,
  notes TEXT,
  action TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE curriculum_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE curated_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view levels" ON curriculum_levels FOR SELECT USING (true);
CREATE POLICY "Anyone can view units" ON curriculum_units FOR SELECT USING (true);
CREATE POLICY "Anyone can view lessons" ON curriculum_lessons FOR SELECT USING (true);
CREATE POLICY "Anyone can view approved exercises" ON curated_exercises FOR SELECT USING (status = 'approved' OR created_by = auth.uid());

CREATE POLICY "Students manage own progress" ON student_progress FOR ALL USING (student_id = auth.uid());
CREATE POLICY "Teachers view student progress" ON student_progress FOR SELECT USING (
  EXISTS (SELECT 1 FROM class_students cs JOIN classes c ON cs.class_id = c.id WHERE cs.student_id = student_progress.student_id AND c.teacher_id = auth.uid())
);

CREATE POLICY "Students view own certs" ON certificates FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Teachers manage exercises" ON curated_exercises FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
);
CREATE POLICY "Teachers manage reviews" ON exercise_reviews FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
);

-- Seed levels
INSERT INTO curriculum_levels (slug, title, description, grade_value, sort_order) VALUES
('kindergarten', 'Kindergarten', 'Introduction to Armenian letters, basic vocabulary, and simple expressions', 'K', 0),
('grade-1', 'Grade 1', 'Building reading skills, expanding vocabulary, simple sentences', '1', 1),
('grade-2', 'Grade 2', 'Reading comprehension, grammar basics, cultural awareness', '2', 2),
('grade-3', 'Grade 3', 'Intermediate vocabulary, verb conjugation, Armenian history', '3', 3),
('grade-4', 'Grade 4', 'Advanced reading, complex grammar, Armenian literature', '4', 4),
('grade-5', 'Grade 5', 'Composition skills, advanced grammar, cultural studies', '5', 5);

-- Seed Kindergarten units
INSERT INTO curriculum_units (level_id, slug, title, description, sort_order)
SELECT l.id, u.slug, u.title, u.description, u.sort_order
FROM curriculum_levels l,
(VALUES
  ('alphabet-1', 'Armenian Alphabet Part 1', 'Letters 1-9 with pronunciation and recognition', 1),
  ('alphabet-2', 'Armenian Alphabet Part 2', 'Letters 10-18 with pronunciation and recognition', 2),
  ('alphabet-3', 'Armenian Alphabet Part 3', 'Letters 19-27 with pronunciation and recognition', 3),
  ('alphabet-4', 'Armenian Alphabet Part 4', 'Letters 28-36 and complete alphabet review', 4),
  ('numbers', 'Numbers 1-10', 'Counting and number recognition in Armenian', 5),
  ('colors', 'Colors', 'Basic color vocabulary in Armenian', 6),
  ('animals', 'Animals', 'Common animal names in Armenian', 7),
  ('family', 'My Family', 'Family member vocabulary in Armenian', 8)
) AS u(slug, title, description, sort_order)
WHERE l.slug = 'kindergarten';

-- Seed lessons for Alphabet Part 1
INSERT INTO curriculum_lessons (unit_id, slug, title, description, lesson_type, sort_order, passing_score)
SELECT u.id, les.slug, les.title, les.description, les.lesson_type, les.sort_order, les.passing_score
FROM curriculum_units u,
(VALUES
  ('lesson-1', 'Lesson 1', 'Learn the first 3 letters', 'practice', 1, 70),
  ('lesson-2', 'Lesson 2', 'Learn letters 4-6', 'practice', 2, 70),
  ('lesson-3', 'Lesson 3', 'Learn letters 7-9', 'practice', 3, 70),
  ('review', 'Review', 'Practice all letters from this unit', 'practice', 4, 70),
  ('quiz', 'Unit Quiz', 'Test your knowledge of letters 1-9', 'quiz', 5, 70)
) AS les(slug, title, description, lesson_type, sort_order, passing_score)
WHERE u.slug = 'alphabet-1';
