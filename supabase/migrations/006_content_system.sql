-- Content items: teacher-entered raw content (words, letters, sentences)
CREATE TABLE content_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID REFERENCES curriculum_units(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES curriculum_lessons(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  sort_order INT NOT NULL,
  item_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

ALTER TABLE content_items DISABLE ROW LEVEL SECURITY;

-- Add template_type to lessons
ALTER TABLE curriculum_lessons ADD COLUMN IF NOT EXISTS template_type TEXT DEFAULT 'vocabulary';
