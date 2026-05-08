-- ── Notification Type Enum ────────────────────────────────────────────────────
CREATE TYPE notification_type AS ENUM (
  -- Matching
  'job_matched',              -- freelancer was matched to a job
  'job_match_expired',        -- notify_at passed, no response
  -- Negotiation
  'negotiation_initiated',    -- client: freelancer opened negotiation
  'negotiation_countered',    -- both: other party countered
  'negotiation_accepted',     -- both: other party accepted
  'negotiation_rejected',     -- both: other party rejected
  'negotiation_failed',       -- both: max rounds reached, no deal
  -- Admin approval
  'deal_pending_admin',       -- admin: deal awaiting approval
  'deal_approved',            -- freelancer + client: admin approved
  'deal_rejected_by_admin',   -- freelancer + client: admin rejected
  -- Assignment
  'assignment_created',       -- freelancer: assignment pending acceptance
  'assignment_accepted',      -- client + admin: freelancer accepted
  'assignment_declined',      -- client + admin: freelancer declined
  'job_in_progress',          -- client: job started
  -- KYC
  'kyc_approved',             -- user: their KYC level was approved
  'kyc_rejected',             -- user: their KYC level was rejected
  -- Admin broadcast
  'admin_broadcast',          -- any user: admin sent platform message
  -- System
  'system'                    -- generic system notification
);

-- ── Notifications Table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  type          notification_type NOT NULL,
  title         VARCHAR(255) NOT NULL,
  body          TEXT NOT NULL,

  -- Optional contextual links
  entity_type   VARCHAR(50),    -- 'job' | 'negotiation' | 'kyc' | 'assignment'
  entity_id     UUID,           -- the ID of the related entity

  -- Rich data payload for frontend (deep links, amounts, etc.)
  data          JSONB DEFAULT '{}',

  is_read       BOOLEAN NOT NULL DEFAULT false,
  read_at       TIMESTAMPTZ,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_notifications_user_id    ON notifications(user_id);
CREATE INDEX idx_notifications_is_read    ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_entity     ON notifications(entity_type, entity_id);