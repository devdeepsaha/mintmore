-- ── Negotiation Status Enum ───────────────────────────────────────────────────
CREATE TYPE negotiation_status AS ENUM (
  'pending',
  'active',
  'agreed',
  'failed',
  'admin_approved',
  'cancelled'
);

CREATE TYPE negotiation_round_sender AS ENUM ('freelancer', 'client');

-- ── 1. Add locking + negotiation fields to jobs ───────────────────────────────
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS active_freelancer_id  UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS backup_freelancer_id  UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS locked_at             TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS negotiation_rounds    INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deal_approved_by      UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS deal_approved_at      TIMESTAMPTZ;

-- ── 2. Matched candidates table ───────────────────────────────────────────────
-- Stores which freelancers were selected by matching engine for this job
CREATE TABLE IF NOT EXISTS job_matched_candidates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  freelancer_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rank            INTEGER NOT NULL,
  score           NUMERIC(6,4) NOT NULL,
  tier            VARCHAR(30),
  notify_at       TIMESTAMPTZ,
  notified_at     TIMESTAMPTZ,
  position        VARCHAR(20) DEFAULT 'candidate', -- 'primary' | 'backup' | 'candidate'
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, freelancer_id)
);

CREATE INDEX idx_matched_candidates_job_id       ON job_matched_candidates(job_id);
CREATE INDEX idx_matched_candidates_freelancer_id ON job_matched_candidates(freelancer_id);

-- ── 3. Negotiations table ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS negotiations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id            UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  freelancer_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  status            negotiation_status NOT NULL DEFAULT 'pending',
  current_round     INTEGER NOT NULL DEFAULT 0,
  max_rounds        INTEGER NOT NULL DEFAULT 2,

  -- Final agreed terms (set when status = agreed)
  agreed_price      NUMERIC(12,2),
  agreed_days       INTEGER,

  -- Admin approval
  admin_note        TEXT,
  approved_by       UUID REFERENCES users(id),
  approved_at       TIMESTAMPTZ,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One active negotiation per job at a time
  UNIQUE(job_id, freelancer_id)
);

CREATE INDEX idx_negotiations_job_id        ON negotiations(job_id);
CREATE INDEX idx_negotiations_freelancer_id ON negotiations(freelancer_id);
CREATE INDEX idx_negotiations_status        ON negotiations(status);

CREATE TRIGGER negotiations_updated_at
  BEFORE UPDATE ON negotiations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 4. Negotiation rounds table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS negotiation_rounds (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negotiation_id   UUID NOT NULL REFERENCES negotiations(id) ON DELETE CASCADE,
  job_id           UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  round_number     INTEGER NOT NULL,
  sender           negotiation_round_sender NOT NULL,
  proposed_price   NUMERIC(12,2) NOT NULL,
  proposed_days    INTEGER,
  message          TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_negotiation_rounds_negotiation_id ON negotiation_rounds(negotiation_id);
CREATE INDEX idx_negotiation_rounds_job_id         ON negotiation_rounds(job_id);

-- ── 5. Update job_status enum to include locked + pending_admin ───────────────
ALTER TYPE job_status ADD VALUE IF NOT EXISTS 'locked';
ALTER TYPE job_status ADD VALUE IF NOT EXISTS 'pending_admin_approval';