-- ── Freelancer Classification Enum ───────────────────────────────────────────
CREATE TYPE freelancer_level AS ENUM ('beginner', 'intermediate', 'experienced');

-- ── Job Status Enum ───────────────────────────────────────────────────────────
CREATE TYPE job_status AS ENUM (
  'draft',
  'open',
  'matching',
  'assigned',
  'in_progress',
  'completed',
  'cancelled'
);

-- ── Job Budget Type Enum ──────────────────────────────────────────────────────
CREATE TYPE budget_type AS ENUM ('fixed', 'expert');

-- ── Proposal Status Enum ──────────────────────────────────────────────────────
CREATE TYPE proposal_status AS ENUM (
  'pending',
  'shortlisted',
  'accepted',
  'rejected'
);

-- ── Assignment Status Enum ────────────────────────────────────────────────────
CREATE TYPE assignment_status AS ENUM (
  'pending_acceptance',
  'accepted',
  'declined',
  'completed',
  'cancelled'
);

-- ── 1. Add platform approval fields to users ──────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_approved          BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS approved_at          TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_by          UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS freelancer_level     freelancer_level,
  ADD COLUMN IF NOT EXISTS level_set_by_admin   BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_available         BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS jobs_completed_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS average_rating       NUMERIC(3,2) DEFAULT 0.00;

-- ── 2. Categories Table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL UNIQUE,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon_url    TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 3. Jobs Table ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id         UUID REFERENCES categories(id),

  title               VARCHAR(255) NOT NULL,
  description         TEXT NOT NULL,
  requirements        TEXT,
  attachments         TEXT[],           -- Supabase Storage URLs

  budget_type         budget_type NOT NULL DEFAULT 'fixed',
  budget_amount       NUMERIC(12,2),    -- NULL if expert pricing
  currency            VARCHAR(10) NOT NULL DEFAULT 'INR',

  required_level      freelancer_level, -- NULL = any level
  required_skills     TEXT[],
  deadline            TIMESTAMPTZ,

  status              job_status NOT NULL DEFAULT 'draft',

  -- Matching metadata
  matched_at          TIMESTAMPTZ,
  match_method        VARCHAR(50),      -- 'ai', 'manual', 'auto'

  -- Admin fields
  admin_note          TEXT,
  assigned_by         UUID REFERENCES users(id),
  assigned_at         TIMESTAMPTZ,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jobs_client_id   ON jobs(client_id);
CREATE INDEX idx_jobs_status      ON jobs(status);
CREATE INDEX idx_jobs_category_id ON jobs(category_id);
CREATE INDEX idx_jobs_budget_type ON jobs(budget_type);

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 4. Proposals Table ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS proposals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  freelancer_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  cover_letter    TEXT NOT NULL,
  proposed_amount NUMERIC(12,2),
  proposed_days   INTEGER,              -- estimated delivery in days

  status          proposal_status NOT NULL DEFAULT 'pending',
  admin_note      TEXT,
  reviewed_by     UUID REFERENCES users(id),
  reviewed_at     TIMESTAMPTZ,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- A freelancer can only submit one proposal per job
  UNIQUE(job_id, freelancer_id)
);

CREATE INDEX idx_proposals_job_id        ON proposals(job_id);
CREATE INDEX idx_proposals_freelancer_id ON proposals(freelancer_id);
CREATE INDEX idx_proposals_status        ON proposals(status);

CREATE TRIGGER proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 5. Job Assignments Table ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  freelancer_id   UUID NOT NULL REFERENCES users(id),
  assigned_by     UUID NOT NULL REFERENCES users(id), -- admin who assigned
  proposal_id     UUID REFERENCES proposals(id),

  status          assignment_status NOT NULL DEFAULT 'pending_acceptance',
  freelancer_note TEXT,                -- freelancer's accept/decline note
  responded_at    TIMESTAMPTZ,

  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  admin_note      TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assignments_job_id        ON job_assignments(job_id);
CREATE INDEX idx_assignments_freelancer_id ON job_assignments(freelancer_id);
CREATE INDEX idx_assignments_status        ON job_assignments(status);

CREATE TRIGGER job_assignments_updated_at
  BEFORE UPDATE ON job_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 6. Seed default categories ────────────────────────────────────────────────
INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Content Writing',     'content-writing',    'Blog posts, articles, copywriting',       1),
  ('Graphic Design',      'graphic-design',     'Logos, branding, illustrations',          2),
  ('Video Editing',       'video-editing',      'Short-form, long-form, reels',            3),
  ('Social Media',        'social-media',       'Posts, strategy, management',             4),
  ('Web Development',     'web-development',    'Frontend, backend, full-stack',           5),
  ('Photography',         'photography',        'Product, portrait, event photography',    6),
  ('Voice Over',          'voice-over',         'Narration, ads, audiobooks',              7),
  ('SEO & Marketing',     'seo-marketing',      'SEO, SEM, email marketing',               8),
  ('AI Content',          'ai-content',         'AI-assisted text, image, video creation', 9),
  ('Translation',         'translation',        'Document and content translation',       10)
ON CONFLICT (slug) DO NOTHING;