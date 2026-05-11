-- ── WhatsApp Conversation Sessions ───────────────────────────────────────────
CREATE TYPE wa_session_state AS ENUM (
  'new_contact',
  'awaiting_service',
  'awaiting_brief',
  'transferring',
  'completed_intake',
  'awaiting_activation',
  'active_job_chat',
  'job_completed'
);

CREATE TABLE IF NOT EXISTS wa_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_wa_number  VARCHAR(30) NOT NULL,
  mm_phone_id       VARCHAR(100) NOT NULL,  -- which MM number they're on
  session_type      VARCHAR(20) NOT NULL DEFAULT 'main',
  -- 'main' | 'category'

  state             wa_session_state NOT NULL DEFAULT 'new_contact',

  -- Collected intake data
  selected_service  VARCHAR(50),            -- '1','2','3','4' → category slug
  project_brief     TEXT,                   -- what they typed as brief
  category_id       UUID REFERENCES categories(id),
  job_id            UUID REFERENCES jobs(id),

  -- Handoff token (main → category)
  handoff_token     VARCHAR(50) UNIQUE,     -- 'MMSTART-xxxxxx'
  handoff_expires_at TIMESTAMPTZ,           -- token valid for 30 minutes
  handoff_used      BOOLEAN DEFAULT false,

  -- Linked user (if they registered on platform)
  user_id           UUID REFERENCES users(id),

  last_message_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One active session per WA number per MM number
  UNIQUE(client_wa_number, mm_phone_id)
);

CREATE INDEX idx_wa_sessions_number    ON wa_sessions(client_wa_number);
CREATE INDEX idx_wa_sessions_token     ON wa_sessions(handoff_token);
CREATE INDEX idx_wa_sessions_state     ON wa_sessions(state);
CREATE INDEX idx_wa_sessions_phone_id  ON wa_sessions(mm_phone_id);

CREATE TRIGGER wa_sessions_updated_at
  BEFORE UPDATE ON wa_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();