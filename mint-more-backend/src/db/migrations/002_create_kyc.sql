-- ── KYC Level Enum ────────────────────────────────────────────────────────────
CREATE TYPE kyc_level AS ENUM ('basic', 'identity', 'address');
CREATE TYPE document_status AS ENUM ('pending', 'approved', 'rejected');

-- ── KYC Submissions Table ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kyc_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level           kyc_level NOT NULL,
  status          document_status NOT NULL DEFAULT 'pending',

  -- Basic level fields
  date_of_birth   DATE,
  gender          VARCHAR(20),
  nationality     VARCHAR(100),

  -- Identity level fields
  document_type   VARCHAR(50),   -- 'aadhaar', 'passport', 'pan', 'driving_license'
  document_number VARCHAR(100),
  document_front_url TEXT,
  document_back_url  TEXT,
  selfie_url         TEXT,

  -- Address level fields
  address_line1   TEXT,
  address_line2   TEXT,
  city            VARCHAR(100),
  state           VARCHAR(100),
  pincode         VARCHAR(20),
  country         VARCHAR(100) DEFAULT 'India',
  address_proof_url TEXT,

  -- Review fields
  admin_note      TEXT,
  reviewed_by     UUID REFERENCES users(id),
  reviewed_at     TIMESTAMPTZ,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_kyc_user_id ON kyc_submissions(user_id);
CREATE INDEX idx_kyc_status  ON kyc_submissions(status);
CREATE INDEX idx_kyc_level   ON kyc_submissions(level);

-- ── Auto-update updated_at ────────────────────────────────────────────────────
CREATE TRIGGER kyc_updated_at
  BEFORE UPDATE ON kyc_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Add profile fields to users ───────────────────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS bio           TEXT,
  ADD COLUMN IF NOT EXISTS skills        TEXT[],
  ADD COLUMN IF NOT EXISTS kyc_level     kyc_level,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS gender        VARCHAR(20),
  ADD COLUMN IF NOT EXISTS address_city  VARCHAR(100),
  ADD COLUMN IF NOT EXISTS address_state VARCHAR(100),
  ADD COLUMN IF NOT EXISTS country       VARCHAR(100) DEFAULT 'India';