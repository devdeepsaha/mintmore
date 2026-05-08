-- ── Users Table ──────────────────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('admin', 'freelancer', 'client');
CREATE TYPE kyc_status AS ENUM ('none', 'pending', 'verified', 'rejected');

CREATE TABLE IF NOT EXISTS users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             VARCHAR(255) NOT NULL UNIQUE,
  phone             VARCHAR(20) UNIQUE,
  password_hash     TEXT NOT NULL,
  role              user_role NOT NULL DEFAULT 'client',
  full_name         VARCHAR(255) NOT NULL,
  avatar_url        TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  is_email_verified BOOLEAN NOT NULL DEFAULT false,
  kyc_status        kyc_status NOT NULL DEFAULT 'none',
  refresh_token     TEXT,
  last_login_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_role     ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- ── Auto-update updated_at ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();