-- ── Transaction Type Enum ─────────────────────────────────────────────────────
CREATE TYPE transaction_type AS ENUM (
  'topup',            -- client adds money via Razorpay
  'escrow_hold',      -- amount locked when deal approved
  'escrow_release',   -- locked amount released to freelancer on completion
  'escrow_refund',    -- locked amount returned to client on cancellation
  'withdrawal',       -- freelancer requests payout
  'withdrawal_approved', -- admin approved payout
  'withdrawal_rejected', -- admin rejected payout (funds returned)
  'platform_fee',     -- platform commission deducted (future use)
  'adjustment'        -- manual admin correction
);

-- ── Transaction Status Enum ───────────────────────────────────────────────────
CREATE TYPE transaction_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'reversed'
);

-- ── Withdrawal Status Enum ────────────────────────────────────────────────────
CREATE TYPE withdrawal_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'paid'
);

-- ── 1. Wallets Table ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wallets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Available balance (can be spent / withdrawn)
  balance         NUMERIC(12,2) NOT NULL DEFAULT 0.00,

  -- Escrowed balance (locked — cannot be spent until released or refunded)
  escrow_balance  NUMERIC(12,2) NOT NULL DEFAULT 0.00,

  currency        VARCHAR(10) NOT NULL DEFAULT 'INR',

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure balances never go negative
  CONSTRAINT wallet_balance_non_negative        CHECK (balance >= 0),
  CONSTRAINT wallet_escrow_balance_non_negative CHECK (escrow_balance >= 0)
);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);

CREATE TRIGGER wallets_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 2. Transactions Table (immutable ledger) ──────────────────────────────────
-- Every financial event is an INSERT — never UPDATE or DELETE.
-- Balance is derived from summing transactions, but wallets table
-- is the cached running total for performance.
CREATE TABLE IF NOT EXISTS transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id         UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id),

  type              transaction_type NOT NULL,
  status            transaction_status NOT NULL DEFAULT 'completed',

  -- Positive = credit (money in), Negative = debit (money out)
  amount            NUMERIC(12,2) NOT NULL,
  currency          VARCHAR(10) NOT NULL DEFAULT 'INR',

  -- Running balance snapshot at time of transaction
  balance_after     NUMERIC(12,2) NOT NULL,
  escrow_after      NUMERIC(12,2) NOT NULL,

  -- References
  reference_id      UUID,           -- job_id, withdrawal_id, razorpay_order_id, etc.
  reference_type    VARCHAR(50),    -- 'job' | 'withdrawal' | 'razorpay_order' | 'manual'

  description       TEXT,
  metadata          JSONB DEFAULT '{}',

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- Intentionally no updated_at — ledger rows are immutable
);

CREATE INDEX idx_transactions_wallet_id   ON transactions(wallet_id);
CREATE INDEX idx_transactions_user_id     ON transactions(user_id);
CREATE INDEX idx_transactions_type        ON transactions(type);
CREATE INDEX idx_transactions_reference   ON transactions(reference_id, reference_type);
CREATE INDEX idx_transactions_created_at  ON transactions(created_at DESC);

-- ── 3. Razorpay Orders Table ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS razorpay_orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id),
  wallet_id           UUID NOT NULL REFERENCES wallets(id),

  razorpay_order_id   VARCHAR(100) NOT NULL UNIQUE,
  razorpay_payment_id VARCHAR(100),           -- set after payment success
  razorpay_signature  VARCHAR(500),           -- set after webhook verify

  amount              NUMERIC(12,2) NOT NULL, -- in INR
  amount_paise        INTEGER NOT NULL,       -- amount × 100 (Razorpay uses paise)
  currency            VARCHAR(10) NOT NULL DEFAULT 'INR',

  status              VARCHAR(30) NOT NULL DEFAULT 'created',
  -- 'created' | 'paid' | 'failed' | 'refunded'

  webhook_verified    BOOLEAN NOT NULL DEFAULT false,
  metadata            JSONB DEFAULT '{}',

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_razorpay_orders_user_id         ON razorpay_orders(user_id);
CREATE INDEX idx_razorpay_orders_razorpay_order_id ON razorpay_orders(razorpay_order_id);

CREATE TRIGGER razorpay_orders_updated_at
  BEFORE UPDATE ON razorpay_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 4. Escrow Records Table ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS escrow_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          UUID NOT NULL UNIQUE REFERENCES jobs(id) ON DELETE CASCADE,
  client_id       UUID NOT NULL REFERENCES users(id),
  freelancer_id   UUID NOT NULL REFERENCES users(id),

  amount          NUMERIC(12,2) NOT NULL,
  currency        VARCHAR(10) NOT NULL DEFAULT 'INR',

  status          VARCHAR(30) NOT NULL DEFAULT 'held',
  -- 'held' | 'released' | 'refunded' | 'disputed'

  held_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  released_at     TIMESTAMPTZ,
  refunded_at     TIMESTAMPTZ,

  hold_tx_id      UUID REFERENCES transactions(id),     -- escrow_hold transaction
  release_tx_id   UUID REFERENCES transactions(id),     -- escrow_release transaction
  refund_tx_id    UUID REFERENCES transactions(id),     -- escrow_refund transaction

  admin_note      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_escrow_job_id        ON escrow_records(job_id);
CREATE INDEX idx_escrow_client_id     ON escrow_records(client_id);
CREATE INDEX idx_escrow_freelancer_id ON escrow_records(freelancer_id);
CREATE INDEX idx_escrow_status        ON escrow_records(status);

CREATE TRIGGER escrow_records_updated_at
  BEFORE UPDATE ON escrow_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 5. Withdrawals Table ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS withdrawals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  wallet_id       UUID NOT NULL REFERENCES wallets(id),

  amount          NUMERIC(12,2) NOT NULL,
  currency        VARCHAR(10) NOT NULL DEFAULT 'INR',

  status          withdrawal_status NOT NULL DEFAULT 'pending',

  -- Bank / UPI details (stored per withdrawal — user may change bank details)
  account_name    VARCHAR(255) NOT NULL,
  account_number  VARCHAR(50) NOT NULL,
  ifsc_code       VARCHAR(20),
  upi_id          VARCHAR(100),

  admin_note      TEXT,
  reviewed_by     UUID REFERENCES users(id),
  reviewed_at     TIMESTAMPTZ,
  paid_at         TIMESTAMPTZ,

  transaction_id  UUID REFERENCES transactions(id),

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status  ON withdrawals(status);

CREATE TRIGGER withdrawals_updated_at
  BEFORE UPDATE ON withdrawals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 6. Auto-create wallet for every new user ──────────────────────────────────
CREATE OR REPLACE FUNCTION create_wallet_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_create_wallet
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_wallet_for_new_user();

-- ── 7. Backfill wallets for existing users ────────────────────────────────────
INSERT INTO wallets (user_id)
SELECT id FROM users
WHERE id NOT IN (SELECT user_id FROM wallets)
ON CONFLICT DO NOTHING;

-- ── 8. Add wallet reference to job_assignments ────────────────────────────────
ALTER TABLE job_assignments
  ADD COLUMN IF NOT EXISTS completed_at_confirmed TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completion_note         TEXT;