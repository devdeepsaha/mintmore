-- ── Message Channel Enum ──────────────────────────────────────────────────────
CREATE TYPE message_channel AS ENUM (
  'web',        -- sent from web app
  'whatsapp'    -- sent/received via WhatsApp
);

CREATE TYPE message_sender_role AS ENUM (
  'client',
  'freelancer',
  'system'      -- automated messages (job status updates, etc.)
);

-- ── 1. Category WhatsApp Numbers ──────────────────────────────────────────────
-- Each Mint More category has a dedicated WhatsApp number.
-- e.g. "MM Videography" → +91XXXXXXXXXX (a WhatsApp Business number)
CREATE TABLE IF NOT EXISTS whatsapp_numbers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     UUID REFERENCES categories(id),
  display_name    VARCHAR(100) NOT NULL,   -- "MM Videography"
  phone_number    VARCHAR(30) NOT NULL UNIQUE, -- E.164 format: +919XXXXXXXXX
  waba_phone_id   VARCHAR(100) NOT NULL UNIQUE, -- WhatsApp Business Account phone_number_id
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER whatsapp_numbers_updated_at
  BEFORE UPDATE ON whatsapp_numbers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 2. Chat Rooms ─────────────────────────────────────────────────────────────
-- One room per job. Created when the job is assigned.
CREATE TABLE IF NOT EXISTS chat_rooms (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id              UUID NOT NULL UNIQUE REFERENCES jobs(id) ON DELETE CASCADE,
  client_id           UUID NOT NULL REFERENCES users(id),
  freelancer_id       UUID NOT NULL REFERENCES users(id),

  -- WhatsApp bridge fields
  client_wa_number    VARCHAR(30),         -- client's WhatsApp number (E.164)
  mm_wa_number_id     VARCHAR(100),        -- which MM number this room uses (waba_phone_id)
  whatsapp_thread_id  VARCHAR(255),        -- last WA message ID for threading

  -- Room state
  is_active           BOOLEAN NOT NULL DEFAULT true,
  last_message_at     TIMESTAMPTZ,
  last_message_preview TEXT,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_rooms_job_id       ON chat_rooms(job_id);
CREATE INDEX idx_chat_rooms_client_id    ON chat_rooms(client_id);
CREATE INDEX idx_chat_rooms_freelancer_id ON chat_rooms(freelancer_id);
CREATE INDEX idx_chat_rooms_client_wa    ON chat_rooms(client_wa_number);

CREATE TRIGGER chat_rooms_updated_at
  BEFORE UPDATE ON chat_rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 3. Messages ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id           UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,

  sender_id         UUID REFERENCES users(id),    -- NULL for system messages
  sender_role       message_sender_role NOT NULL,

  content           TEXT NOT NULL,
  channel           message_channel NOT NULL DEFAULT 'web',

  -- WhatsApp metadata
  wa_message_id     VARCHAR(255),   -- WhatsApp message ID (for receipts/dedup)
  wa_status         VARCHAR(30),    -- 'sent' | 'delivered' | 'read' | 'failed'

  -- Attachments
  attachment_url    TEXT,
  attachment_type   VARCHAR(50),    -- 'image' | 'video' | 'document' | 'audio'

  -- Read tracking
  read_by_client      BOOLEAN NOT NULL DEFAULT false,
  read_by_freelancer  BOOLEAN NOT NULL DEFAULT false,
  read_at_client      TIMESTAMPTZ,
  read_at_freelancer  TIMESTAMPTZ,

  is_deleted        BOOLEAN NOT NULL DEFAULT false,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_room_id    ON messages(room_id);
CREATE INDEX idx_messages_sender_id  ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(room_id, created_at DESC);
CREATE INDEX idx_messages_wa_id      ON messages(wa_message_id) WHERE wa_message_id IS NOT NULL;

-- ── 4. Add WhatsApp number field to users (for client WA verification) ────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS whatsapp_number  VARCHAR(30),
  ADD COLUMN IF NOT EXISTS wa_verified      BOOLEAN NOT NULL DEFAULT false;

-- ── 5. Online presence table (Redis handles live presence — this is fallback) ──
CREATE TABLE IF NOT EXISTS user_presence (
  user_id       UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  is_online     BOOLEAN NOT NULL DEFAULT false,
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backfill presence rows for existing users
INSERT INTO user_presence (user_id)
SELECT id FROM users
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION create_presence_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_presence (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_create_presence
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_presence_for_new_user();


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