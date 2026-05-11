-- ── Platform Enum ─────────────────────────────────────────────────────────────
CREATE TYPE social_platform AS ENUM (
  'facebook',
  'instagram',
  'youtube'
);

-- ── Post Status Enum ──────────────────────────────────────────────────────────
CREATE TYPE social_post_status AS ENUM (
  'draft',
  'scheduled',
  'publishing',
  'published',
  'failed',
  'cancelled'
);

-- ── Platform Post Status ──────────────────────────────────────────────────────
CREATE TYPE platform_post_status AS ENUM (
  'pending',
  'publishing',
  'published',
  'failed',
  'skipped'
);

-- ── Content Type Enum ─────────────────────────────────────────────────────────
CREATE TYPE social_content_type AS ENUM (
  'text',
  'image',
  'video',
  'carousel',
  'reel',
  'short',
  'story'
);

-- ── 1. Social Accounts (connected platform accounts per user) ─────────────────
CREATE TABLE IF NOT EXISTS social_accounts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform            social_platform NOT NULL,

  -- Platform-specific IDs
  platform_user_id    VARCHAR(255) NOT NULL,  -- Facebook user/page ID, YT channel ID
  platform_username   VARCHAR(255),           -- @handle or channel name
  platform_name       VARCHAR(255),           -- display name on platform
  platform_avatar_url TEXT,

  -- For Facebook/Instagram — the connected Page or IG Business Account
  page_id             VARCHAR(255),           -- Facebook Page ID
  page_name           VARCHAR(255),
  instagram_account_id VARCHAR(255),          -- IG Business Account ID linked to FB Page

  -- OAuth tokens (stored as-is — encrypted at rest via Supabase)
  access_token        TEXT NOT NULL,
  refresh_token       TEXT,
  token_expires_at    TIMESTAMPTZ,
  token_scope         TEXT,                   -- comma-separated scopes granted

  is_active           BOOLEAN NOT NULL DEFAULT true,
  last_used_at        TIMESTAMPTZ,
  last_error          TEXT,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One account per platform per user (can reconnect to update token)
  UNIQUE(user_id, platform, platform_user_id)
);

CREATE INDEX idx_social_accounts_user_id  ON social_accounts(user_id);
CREATE INDEX idx_social_accounts_platform ON social_accounts(platform);

CREATE TRIGGER social_accounts_updated_at
  BEFORE UPDATE ON social_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 2. Social Posts ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS social_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Content
  title           VARCHAR(255),               -- internal label (not posted)
  caption         TEXT,                       -- main post text / caption
  hashtags        TEXT[],                     -- ['#marketing', '#design']
  mentions        TEXT[],                     -- ['@username']

  content_type    social_content_type NOT NULL DEFAULT 'text',

  -- Scheduling
  status          social_post_status NOT NULL DEFAULT 'draft',
  publish_at      TIMESTAMPTZ,               -- NULL = publish immediately
  published_at    TIMESTAMPTZ,               -- when all platforms completed

  -- Which platforms to post to (array of platform enum values)
  target_platforms social_platform[] NOT NULL DEFAULT '{}',

  -- BullMQ job reference
  queue_job_id    VARCHAR(255),

  -- Optional link to a Mint More job (freelancer delivered content)
  source_job_id   UUID REFERENCES jobs(id),

  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_social_posts_user_id    ON social_posts(user_id);
CREATE INDEX idx_social_posts_status     ON social_posts(status);
CREATE INDEX idx_social_posts_publish_at ON social_posts(publish_at)
  WHERE status = 'scheduled';

CREATE TRIGGER social_posts_updated_at
  BEFORE UPDATE ON social_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 3. Post Media ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS social_post_media (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id         UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id),

  media_url       TEXT NOT NULL,             -- Supabase Storage public URL
  media_type      VARCHAR(20) NOT NULL,      -- 'image' | 'video' | 'audio'
  mime_type       VARCHAR(50),
  file_size_bytes BIGINT,
  duration_seconds INTEGER,                 -- for video
  width           INTEGER,
  height          INTEGER,

  thumbnail_url   TEXT,                      -- for video posts
  alt_text        TEXT,                      -- accessibility

  sort_order      INTEGER NOT NULL DEFAULT 0, -- for carousel ordering

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_social_post_media_post_id ON social_post_media(post_id);

-- ── 4. Per-Platform Post Status ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS social_post_platforms (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id               UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  social_account_id     UUID NOT NULL REFERENCES social_accounts(id),
  platform              social_platform NOT NULL,

  status                platform_post_status NOT NULL DEFAULT 'pending',

  -- Platform-specific post ID after publishing
  platform_post_id      VARCHAR(255),        -- FB post ID, IG media ID, YT video ID
  platform_post_url     TEXT,               -- public URL of the post

  -- Platform-specific fields
  platform_title        VARCHAR(500),        -- YouTube video title
  platform_description  TEXT,               -- YouTube description
  privacy_status        VARCHAR(20),         -- YouTube: 'public'|'private'|'unlisted'

  -- Error tracking
  error_message         TEXT,
  retry_count           INTEGER NOT NULL DEFAULT 0,
  last_retry_at         TIMESTAMPTZ,

  -- Analytics (pulled on-demand)
  views_count           BIGINT DEFAULT 0,
  likes_count           BIGINT DEFAULT 0,
  comments_count        BIGINT DEFAULT 0,
  shares_count          BIGINT DEFAULT 0,
  reach_count           BIGINT DEFAULT 0,
  analytics_pulled_at   TIMESTAMPTZ,

  published_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(post_id, platform)
);

CREATE INDEX idx_spp_post_id    ON social_post_platforms(post_id);
CREATE INDEX idx_spp_account_id ON social_post_platforms(social_account_id);
CREATE INDEX idx_spp_status     ON social_post_platforms(status);

CREATE TRIGGER social_post_platforms_updated_at
  BEFORE UPDATE ON social_post_platforms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();