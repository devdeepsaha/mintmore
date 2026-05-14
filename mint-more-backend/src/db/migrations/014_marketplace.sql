-- Addon Feature Enum
CREATE TYPE addon_feature AS ENUM (
	'browse_freelancers',
	'direct_inquiry',
	'priority_matching',
	'advanced_analytics'
);

-- 1. Addon Plans (admin-managed)
CREATE TABLE IF NOT EXISTS addon_plans (
	id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	name            VARCHAR(255) NOT NULL,
	description     TEXT,
	price           NUMERIC(10,2) NOT NULL,
	duration_days   INTEGER NOT NULL,
	features        addon_feature[] NOT NULL DEFAULT '{}',
	is_active       BOOLEAN NOT NULL DEFAULT true,
	is_featured     BOOLEAN NOT NULL DEFAULT false,
	sort_order      INTEGER NOT NULL DEFAULT 0,
	created_by      UUID REFERENCES users(id),
	created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER addon_plans_updated_at
	BEFORE UPDATE ON addon_plans
	FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed default plans
INSERT INTO addon_plans
	(name, description, price, duration_days, features, is_featured, sort_order)
VALUES
(
	'Browse - 7 Days',
	'Access the freelancer marketplace for 7 days. Browse profiles, view packages and portfolios.',
	199, 7,
	ARRAY['browse_freelancers','direct_inquiry']::addon_feature[],
	false, 1
),
(
	'Browse - 30 Days',
	'Full marketplace access for 30 days. Browse, contact, and hire freelancers directly.',
	599, 30,
	ARRAY['browse_freelancers','direct_inquiry']::addon_feature[],
	true, 2
),
(
	'Browse - 90 Days',
	'Best value. 3 months of full marketplace access.',
	1299, 90,
	ARRAY['browse_freelancers','direct_inquiry']::addon_feature[],
	false, 3
)
ON CONFLICT DO NOTHING;

-- 2. Client Addons (purchased plans)
CREATE TABLE IF NOT EXISTS client_addons (
	id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	addon_plan_id   UUID NOT NULL REFERENCES addon_plans(id),

	price_paid      NUMERIC(10,2) NOT NULL,
	duration_days   INTEGER NOT NULL,
	features        addon_feature[] NOT NULL,

	-- Validity window
	starts_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	expires_at      TIMESTAMPTZ NOT NULL,

	is_active       BOOLEAN NOT NULL DEFAULT true,

	-- Wallet transaction reference
	transaction_id  UUID REFERENCES transactions(id),

	created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_client_addons_user_id    ON client_addons(user_id);
CREATE INDEX idx_client_addons_expires_at ON client_addons(expires_at);
CREATE INDEX idx_client_addons_active     ON client_addons(user_id, is_active);

-- 3. Freelancer Packages
CREATE TABLE IF NOT EXISTS freelancer_packages (
	id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	freelancer_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

	package_type    VARCHAR(20) NOT NULL,
	-- 'basic' | 'standard' | 'premium'

	name            VARCHAR(255) NOT NULL,
	description     TEXT NOT NULL,
	price           NUMERIC(10,2) NOT NULL,
	delivery_days   INTEGER NOT NULL,
	revisions       VARCHAR(50) NOT NULL DEFAULT 'Unlimited',
	-- 'Unlimited' or a number

	-- What's included (flexible JSONB)
	inclusions      JSONB DEFAULT '{}',

	is_active       BOOLEAN NOT NULL DEFAULT true,

	created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	UNIQUE(freelancer_id, package_type)
);

CREATE INDEX idx_packages_freelancer_id ON freelancer_packages(freelancer_id);

CREATE TRIGGER freelancer_packages_updated_at
	BEFORE UPDATE ON freelancer_packages
	FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. Portfolio Items
CREATE TABLE IF NOT EXISTS portfolio_items (
	id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	freelancer_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

	title           VARCHAR(255) NOT NULL,
	description     TEXT,
	category_id     UUID REFERENCES categories(id),

	-- Media
	cover_image_url TEXT NOT NULL,
	media_urls      TEXT[] DEFAULT '{}',

	-- Metadata
	tags            TEXT[] DEFAULT '{}',
	tools_used      TEXT[] DEFAULT '{}',

	-- Project details
	project_cost_min NUMERIC(10,2),
	project_cost_max NUMERIC(10,2),
	project_duration VARCHAR(50),

	client_name     VARCHAR(255),

	is_featured     BOOLEAN NOT NULL DEFAULT false,
	is_visible      BOOLEAN NOT NULL DEFAULT true,
	sort_order      INTEGER NOT NULL DEFAULT 0,

	created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_portfolio_freelancer_id ON portfolio_items(freelancer_id);
CREATE INDEX idx_portfolio_category_id  ON portfolio_items(category_id);
CREATE INDEX idx_portfolio_visible      ON portfolio_items(is_visible);

CREATE TRIGGER portfolio_items_updated_at
	BEFORE UPDATE ON portfolio_items
	FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5. Reviews
CREATE TABLE IF NOT EXISTS reviews (
	id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	freelancer_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	client_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	job_id          UUID REFERENCES jobs(id),

	rating_overall       NUMERIC(2,1) NOT NULL,
	rating_communication NUMERIC(2,1) NOT NULL,
	rating_quality       NUMERIC(2,1) NOT NULL,
	rating_value         NUMERIC(2,1) NOT NULL,

	review_text     TEXT,

	price_range_min NUMERIC(10,2),
	price_range_max NUMERIC(10,2),
	job_duration    VARCHAR(50),

	is_visible      BOOLEAN NOT NULL DEFAULT true,

	created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	UNIQUE(client_id, job_id)
);

CREATE INDEX idx_reviews_freelancer_id ON reviews(freelancer_id);
CREATE INDEX idx_reviews_client_id     ON reviews(client_id);
CREATE INDEX idx_reviews_visible       ON reviews(freelancer_id, is_visible);

CREATE TRIGGER reviews_updated_at
	BEFORE UPDATE ON reviews
	FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 6. Direct Inquiries
CREATE TABLE IF NOT EXISTS direct_inquiries (
	id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	client_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	freelancer_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	package_id      UUID REFERENCES freelancer_packages(id),

	message         TEXT NOT NULL,
	budget          NUMERIC(10,2),
	deadline_days   INTEGER,

	status          VARCHAR(30) NOT NULL DEFAULT 'pending',
	-- 'pending' | 'responded' | 'accepted' | 'declined' | 'converted_to_job'

	freelancer_response TEXT,
	responded_at    TIMESTAMPTZ,

	job_id          UUID REFERENCES jobs(id),

	created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inquiries_client_id     ON direct_inquiries(client_id);
CREATE INDEX idx_inquiries_freelancer_id ON direct_inquiries(freelancer_id);
CREATE INDEX idx_inquiries_status        ON direct_inquiries(status);

CREATE TRIGGER direct_inquiries_updated_at
	BEFORE UPDATE ON direct_inquiries
	FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 7. Add marketplace fields to users
ALTER TABLE users
	ADD COLUMN IF NOT EXISTS marketplace_visible  BOOLEAN NOT NULL DEFAULT false,
	ADD COLUMN IF NOT EXISTS tagline              VARCHAR(255),
	ADD COLUMN IF NOT EXISTS hourly_rate          NUMERIC(10,2),
	ADD COLUMN IF NOT EXISTS response_time_hours  INTEGER DEFAULT 24,
	ADD COLUMN IF NOT EXISTS languages            TEXT[] DEFAULT '{}',
	ADD COLUMN IF NOT EXISTS review_count         INTEGER NOT NULL DEFAULT 0,
	ADD COLUMN IF NOT EXISTS review_avg_overall   NUMERIC(3,2) DEFAULT 0.00,
	ADD COLUMN IF NOT EXISTS review_avg_comm      NUMERIC(3,2) DEFAULT 0.00,
	ADD COLUMN IF NOT EXISTS review_avg_quality   NUMERIC(3,2) DEFAULT 0.00,
	ADD COLUMN IF NOT EXISTS review_avg_value     NUMERIC(3,2) DEFAULT 0.00;
