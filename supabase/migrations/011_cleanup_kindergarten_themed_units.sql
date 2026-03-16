-- Delete wrong content for Kindergarten themed units so bulk generate can regenerate with correct prompts
DELETE FROM curated_exercises WHERE lesson_id IN (
  SELECT cl.id FROM curriculum_lessons cl
  JOIN curriculum_units cu ON cl.unit_id = cu.id
  WHERE cu.level_id = (SELECT id FROM curriculum_levels WHERE slug = 'kindergarten')
  AND cu.slug IN ('numbers', 'colors', 'animals', 'family')
);

DELETE FROM content_items WHERE lesson_id IN (
  SELECT cl.id FROM curriculum_lessons cl
  JOIN curriculum_units cu ON cl.unit_id = cu.id
  WHERE cu.level_id = (SELECT id FROM curriculum_levels WHERE slug = 'kindergarten')
  AND cu.slug IN ('numbers', 'colors', 'animals', 'family')
);
