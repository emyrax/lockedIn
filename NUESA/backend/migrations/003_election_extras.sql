-- Add verified status to candidates
ALTER TABLE candidates DROP CONSTRAINT IF EXISTS candidates_status_check;
ALTER TABLE candidates ADD CONSTRAINT candidates_status_check
  CHECK (status IN ('pending','verified','approved','rejected'));

-- Add verified tracking
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES profiles(id);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Index for faster position lookups during voting
CREATE INDEX IF NOT EXISTS idx_candidates_verified ON candidates(position_id, status) WHERE status IN ('verified','approved');

-- Function to check only one concurrent election in nomination/voting
CREATE OR REPLACE FUNCTION check_election_overlap()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('nomination', 'voting') THEN
    IF EXISTS (
      SELECT 1 FROM elections
      WHERE status IN ('nomination', 'voting')
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000')
    ) THEN
      RAISE EXCEPTION 'Only one election can be in nomination or voting status at a time';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_election_overlap ON elections;
CREATE TRIGGER trg_election_overlap
  BEFORE INSERT OR UPDATE OF status ON elections
  FOR EACH ROW
  EXECUTE FUNCTION check_election_overlap();

-- Function to validate election status transitions
CREATE OR REPLACE FUNCTION validate_election_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  IF NOT (
    (OLD.status = 'draft' AND NEW.status = 'pending') OR
    (OLD.status = 'pending' AND NEW.status = 'nomination') OR
    (OLD.status = 'nomination' AND NEW.status = 'voting') OR
    (OLD.status = 'voting' AND NEW.status = 'completed') OR
    (OLD.status IN ('draft', 'pending', 'nomination') AND NEW.status = 'cancelled')
  ) THEN
    RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_election_transition ON elections;
CREATE TRIGGER trg_election_transition
  BEFORE UPDATE OF status ON elections
  FOR EACH ROW
  EXECUTE FUNCTION validate_election_transition();