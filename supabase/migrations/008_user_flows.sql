-- Parent-child relationship
CREATE TABLE IF NOT EXISTS parent_children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  child_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_id, child_id)
);

-- Class memberships
CREATE TABLE IF NOT EXISTS class_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'active',
  UNIQUE(class_id, student_id)
);

-- Profile extensions
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS grade_level_id UUID REFERENCES curriculum_levels(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

-- Class extensions
ALTER TABLE classes ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS max_students INT DEFAULT 50;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_classes_join_code ON classes(join_code) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_class_memberships_student ON class_memberships(student_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_class_memberships_class ON class_memberships(class_id) WHERE status = 'active';

-- RLS
ALTER TABLE parent_children ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents view children" ON parent_children FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Parents add children" ON parent_children FOR INSERT WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "View class members" ON class_memberships FOR SELECT USING (
  class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid()) OR student_id = auth.uid()
);
CREATE POLICY "Students join classes" ON class_memberships FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Set existing class-joined students to school tier
UPDATE profiles SET subscription_tier = 'school'
WHERE id IN (SELECT student_id FROM class_students);
