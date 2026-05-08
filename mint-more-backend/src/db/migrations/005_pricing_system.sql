-- ── Pricing Mode Enum ─────────────────────────────────────────────────────────
CREATE TYPE pricing_mode AS ENUM ('budget', 'expert');

-- ── 1. Add pricing_mode to jobs ───────────────────────────────────────────────
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS pricing_mode pricing_mode NOT NULL DEFAULT 'budget';

-- ── 2. Add pricing fields to users (freelancer profile) ──────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS price_min           NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS price_max           NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS pricing_visibility  BOOLEAN NOT NULL DEFAULT true;

-- ── 3. Category Price Ranges Table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS category_price_ranges (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  category_id         UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,

  -- Per-level min/max in INR
  beginner_min        NUMERIC(10,2) NOT NULL DEFAULT 500,
  beginner_max        NUMERIC(10,2) NOT NULL DEFAULT 2000,

  intermediate_min    NUMERIC(10,2) NOT NULL DEFAULT 2000,
  intermediate_max    NUMERIC(10,2) NOT NULL DEFAULT 8000,

  experienced_min     NUMERIC(10,2) NOT NULL DEFAULT 8000,
  experienced_max     NUMERIC(10,2) NOT NULL DEFAULT 25000,

  currency            VARCHAR(10)   NOT NULL DEFAULT 'INR',
  notes               TEXT,                    -- admin notes on pricing rationale

  created_by          UUID REFERENCES users(id),
  updated_by          UUID REFERENCES users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One price range per category
  UNIQUE(category_id)
);

CREATE INDEX idx_price_ranges_category ON category_price_ranges(category_id);

CREATE TRIGGER category_price_ranges_updated_at
  BEFORE UPDATE ON category_price_ranges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 4. Seed default price ranges for existing categories ─────────────────────
-- Values are realistic INR market rates for Indian freelance market
INSERT INTO category_price_ranges
  (category_id, beginner_min, beginner_max,
   intermediate_min, intermediate_max,
   experienced_min, experienced_max)
SELECT
  c.id,
  CASE c.slug
    WHEN 'content-writing'  THEN 300
    WHEN 'graphic-design'   THEN 500
    WHEN 'video-editing'    THEN 1000
    WHEN 'social-media'     THEN 500
    WHEN 'web-development'  THEN 2000
    WHEN 'photography'      THEN 1000
    WHEN 'voice-over'       THEN 500
    WHEN 'seo-marketing'    THEN 1000
    WHEN 'ai-content'       THEN 500
    WHEN 'translation'      THEN 300
    ELSE 500
  END AS beginner_min,
  CASE c.slug
    WHEN 'content-writing'  THEN 1500
    WHEN 'graphic-design'   THEN 3000
    WHEN 'video-editing'    THEN 5000
    WHEN 'social-media'     THEN 2500
    WHEN 'web-development'  THEN 8000
    WHEN 'photography'      THEN 5000
    WHEN 'voice-over'       THEN 2500
    WHEN 'seo-marketing'    THEN 4000
    WHEN 'ai-content'       THEN 2500
    WHEN 'translation'      THEN 1500
    ELSE 2000
  END AS beginner_max,
  CASE c.slug
    WHEN 'content-writing'  THEN 1500
    WHEN 'graphic-design'   THEN 3000
    WHEN 'video-editing'    THEN 5000
    WHEN 'social-media'     THEN 2500
    WHEN 'web-development'  THEN 8000
    WHEN 'photography'      THEN 5000
    WHEN 'voice-over'       THEN 2500
    WHEN 'seo-marketing'    THEN 4000
    WHEN 'ai-content'       THEN 2500
    WHEN 'translation'      THEN 1500
    ELSE 2000
  END AS intermediate_min,
  CASE c.slug
    WHEN 'content-writing'  THEN 5000
    WHEN 'graphic-design'   THEN 10000
    WHEN 'video-editing'    THEN 15000
    WHEN 'social-media'     THEN 8000
    WHEN 'web-development'  THEN 25000
    WHEN 'photography'      THEN 15000
    WHEN 'voice-over'       THEN 8000
    WHEN 'seo-marketing'    THEN 12000
    WHEN 'ai-content'       THEN 8000
    WHEN 'translation'      THEN 5000
    ELSE 8000
  END AS intermediate_max,
  CASE c.slug
    WHEN 'content-writing'  THEN 5000
    WHEN 'graphic-design'   THEN 10000
    WHEN 'video-editing'    THEN 15000
    WHEN 'social-media'     THEN 8000
    WHEN 'web-development'  THEN 25000
    WHEN 'photography'      THEN 15000
    WHEN 'voice-over'       THEN 8000
    WHEN 'seo-marketing'    THEN 12000
    WHEN 'ai-content'       THEN 8000
    WHEN 'translation'      THEN 5000
    ELSE 8000
  END AS experienced_min,
  CASE c.slug
    WHEN 'content-writing'  THEN 15000
    WHEN 'graphic-design'   THEN 30000
    WHEN 'video-editing'    THEN 50000
    WHEN 'social-media'     THEN 25000
    WHEN 'web-development'  THEN 100000
    WHEN 'photography'      THEN 50000
    WHEN 'voice-over'       THEN 25000
    WHEN 'seo-marketing'    THEN 40000
    WHEN 'ai-content'       THEN 25000
    WHEN 'translation'      THEN 15000
    ELSE 25000
  END AS experienced_max
FROM categories c
ON CONFLICT (category_id) DO NOTHING;