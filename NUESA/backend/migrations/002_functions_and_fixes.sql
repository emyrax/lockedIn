-- Fix: Add is_featured column to projects (referenced by index but missing)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

DROP INDEX IF EXISTS idx_projects_featured;
CREATE INDEX idx_projects_featured ON projects(is_featured) WHERE is_featured = TRUE;

-- Function: increment project upvotes
CREATE OR REPLACE FUNCTION increment_project_upvotes(project_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE projects
  SET upvote_count = upvote_count + 1
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: decrement project upvotes
CREATE OR REPLACE FUNCTION decrement_project_upvotes(project_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE projects
  SET upvote_count = GREATEST(upvote_count - 1, 0)
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sync is_featured column with status
UPDATE projects SET is_featured = (status = 'featured') WHERE is_featured IS DISTINCT FROM (status = 'featured');