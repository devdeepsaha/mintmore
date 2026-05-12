-- ── AI Tool Type Enum ─────────────────────────────────────────────────────────
CREATE TYPE ai_tool_type AS ENUM (
  'text',
  'image',
  'video_script',
  'caption',
  'repurpose'
);

CREATE TYPE ai_generation_status AS ENUM (
  'queued',
  'processing',
  'completed',
  'failed',
  'cancelled'
);

CREATE TYPE ai_model_tier AS ENUM (
  'free',
  'standard',
  'premium'
);

-- ── 1. AI Models Table (admin-managed) ───────────────────────────────────────
-- All models are managed from the admin panel, not hardcoded in JS.
CREATE TABLE IF NOT EXISTS ai_models (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- OpenRouter model string — used in API calls
  openrouter_id       VARCHAR(255) NOT NULL UNIQUE,
  -- e.g. 'meta-llama/llama-3.1-8b-instruct:free'

  name                VARCHAR(255) NOT NULL,      -- display name
  description         TEXT,                       -- shown in UI
  provider_name       VARCHAR(100),               -- 'Meta', 'OpenAI', 'Google', etc.

  -- Which tools this model supports (array of ai_tool_type)
  supported_tools     ai_tool_type[] NOT NULL DEFAULT '{}',

  tier                ai_model_tier NOT NULL DEFAULT 'free',
  cost_per_1k_tokens  NUMERIC(10,4) NOT NULL DEFAULT 0,
  -- 0 = free, otherwise credits per 1K tokens

  context_window      INTEGER DEFAULT 8192,

  -- UI metadata
  tags                TEXT[] DEFAULT '{}',
  -- e.g. ['fast', 'creative', 'multilingual']
  is_trending         BOOLEAN NOT NULL DEFAULT false,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  sort_order          INTEGER NOT NULL DEFAULT 0,

  -- System prompt override per tool type (JSONB map)
  -- e.g. { "caption": "You are a social media expert...", "text": "..." }
  system_prompts      JSONB DEFAULT '{}',

  -- Performance stats (updated by cron / worker)
  avg_response_ms     INTEGER,
  total_requests      BIGINT DEFAULT 0,
  total_failures      BIGINT DEFAULT 0,

  added_by            UUID REFERENCES users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_models_tier      ON ai_models(tier);
CREATE INDEX idx_ai_models_active    ON ai_models(is_active);
CREATE INDEX idx_ai_models_trending  ON ai_models(is_trending);

CREATE TRIGGER ai_models_updated_at
  BEFORE UPDATE ON ai_models
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 2. AI Generations ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_generations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ai_model_id     UUID REFERENCES ai_models(id),

  tool_type       ai_tool_type NOT NULL,
  openrouter_id   VARCHAR(255) NOT NULL,
  model_name      VARCHAR(255),

  prompt          TEXT NOT NULL,
  parameters      JSONB DEFAULT '{}',

  status          ai_generation_status NOT NULL DEFAULT 'queued',
  result_text     TEXT,
  result_url      TEXT,
  result_metadata JSONB DEFAULT '{}',

  queued_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  duration_ms     INTEGER,

  credits_used    NUMERIC(10,4) DEFAULT 0,
  tokens_input    INTEGER DEFAULT 0,
  tokens_output   INTEGER DEFAULT 0,

  error_message   TEXT,
  retry_count     INTEGER DEFAULT 0,
  used_failover   BOOLEAN DEFAULT false,
  failover_model  VARCHAR(255),

  queue_job_id    VARCHAR(255),
  source_post_id  UUID REFERENCES social_posts(id),
  source_job_id   UUID REFERENCES jobs(id),

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_gen_user_id    ON ai_generations(user_id);
CREATE INDEX idx_ai_gen_status     ON ai_generations(status);
CREATE INDEX idx_ai_gen_tool_type  ON ai_generations(tool_type);
CREATE INDEX idx_ai_gen_model_id   ON ai_generations(ai_model_id);
CREATE INDEX idx_ai_gen_created_at ON ai_generations(created_at DESC);

CREATE TRIGGER ai_generations_updated_at
  BEFORE UPDATE ON ai_generations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 3. AI Usage Log ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_usage_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ai_model_id     UUID REFERENCES ai_models(id),
  generation_id   UUID REFERENCES ai_generations(id),

  tool_type       ai_tool_type NOT NULL,
  openrouter_id   VARCHAR(255) NOT NULL,

  credits_used    NUMERIC(10,4) NOT NULL DEFAULT 0,
  tokens_input    INTEGER DEFAULT 0,
  tokens_output   INTEGER DEFAULT 0,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_user_id    ON ai_usage_log(user_id);
CREATE INDEX idx_ai_usage_model_id   ON ai_usage_log(ai_model_id);
CREATE INDEX idx_ai_usage_created_at ON ai_usage_log(created_at DESC);

-- ── 4. Seed default models ────────────────────────────────────────────────────
INSERT INTO ai_models
  (openrouter_id, name, description, provider_name,
   supported_tools, tier, cost_per_1k_tokens,
   context_window, tags, is_trending, sort_order)
VALUES
-- Free models
(
  'meta-llama/llama-3.1-8b-instruct:free',
  'Llama 3.1 8B', 'Meta''s fast open-source model. Great for captions and short content.', 'Meta',
  ARRAY['text','caption','repurpose','video_script']::ai_tool_type[],
  'free', 0, 131072, ARRAY['fast','free','multilingual'], true, 1
),
(
  'meta-llama/llama-3.1-70b-instruct:free',
  'Llama 3.1 70B', 'Larger Llama model. Better quality, slightly slower.', 'Meta',
  ARRAY['text','caption','repurpose','video_script']::ai_tool_type[],
  'free', 0, 131072, ARRAY['powerful','free','multilingual'], false, 2
),
(
  'google/gemma-2-9b-it:free',
  'Gemma 2 9B', 'Google''s lightweight model. Fast responses.', 'Google',
  ARRAY['text','caption']::ai_tool_type[],
  'free', 0, 8192, ARRAY['fast','free','google'], false, 3
),
(
  'mistralai/mistral-7b-instruct:free',
  'Mistral 7B', 'Efficient European model. Good for structured content.', 'Mistral AI',
  ARRAY['text','caption','repurpose']::ai_tool_type[],
  'free', 0, 32768, ARRAY['fast','free'], false, 4
),
(
  'microsoft/phi-3-mini-128k-instruct:free',
  'Phi-3 Mini', 'Microsoft''s tiny but capable model. Best for simple tasks.', 'Microsoft',
  ARRAY['text','caption']::ai_tool_type[],
  'free', 0, 128000, ARRAY['tiny','fast','free'], false, 5
),
(
  'qwen/qwen-2-7b-instruct:free',
  'Qwen 2 7B', 'Alibaba''s multilingual model. Strong on Asian languages.', 'Alibaba',
  ARRAY['text','caption','repurpose']::ai_tool_type[],
  'free', 0, 131072, ARRAY['free','multilingual'], false, 6
),
-- Standard models
(
  'openai/gpt-4o-mini',
  'GPT-4o Mini', 'OpenAI''s efficient model. Best balance of speed and quality.', 'OpenAI',
  ARRAY['text','caption','repurpose','video_script']::ai_tool_type[],
  'standard', 3, 128000, ARRAY['fast','reliable','openai'], true, 10
),
(
  'anthropic/claude-3-haiku',
  'Claude 3 Haiku', 'Anthropic''s fast model. Excellent for creative writing.', 'Anthropic',
  ARRAY['text','caption','repurpose','video_script']::ai_tool_type[],
  'standard', 3, 200000, ARRAY['fast','creative','anthropic'], true, 11
),
(
  'google/gemini-flash-1.5',
  'Gemini 1.5 Flash', 'Google''s fast model with 1M token context.', 'Google',
  ARRAY['text','caption','repurpose','video_script']::ai_tool_type[],
  'standard', 2, 1000000, ARRAY['fast','huge-context','google'], true, 12
),
(
  'mistralai/mistral-nemo',
  'Mistral Nemo', 'Mistral''s updated model. Strong multilingual support.', 'Mistral AI',
  ARRAY['text','caption','repurpose']::ai_tool_type[],
  'standard', 2, 128000, ARRAY['multilingual'], false, 13
),
-- Premium models
(
  'openai/gpt-4o',
  'GPT-4o', 'OpenAI''s flagship model. Best for complex content.', 'OpenAI',
  ARRAY['text','caption','repurpose','video_script','image']::ai_tool_type[],
  'premium', 15, 128000, ARRAY['powerful','multimodal','openai'], false, 20
),
(
  'anthropic/claude-3.5-sonnet',
  'Claude 3.5 Sonnet', 'Anthropic''s best model. Outstanding creative writing.', 'Anthropic',
  ARRAY['text','caption','repurpose','video_script']::ai_tool_type[],
  'premium', 18, 200000, ARRAY['powerful','creative','anthropic'], true, 21
),
(
  'google/gemini-pro-1.5',
  'Gemini Pro 1.5', 'Google''s pro model with 2M token context.', 'Google',
  ARRAY['text','caption','repurpose','video_script']::ai_tool_type[],
  'premium', 10, 2000000, ARRAY['powerful','huge-context','google'], false, 22
)
ON CONFLICT (openrouter_id) DO NOTHING;