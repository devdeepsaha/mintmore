# 🌿 Mint More — SaaS Platform
### Master Project README — Progress Tracker & Context Document
> **Purpose:** Tracks every phase, decision, config, and file in the Mint More backend.
> Paste the resume block at the bottom into a new Claude chat to continue exactly where you left off.

---

## 🧠 Project Summary

**Mint More** is a production-level controlled matchmaking + negotiation SaaS platform for Indian creative businesses.

- **NOT** an open bidding marketplace — uses structured negotiation with admin oversight
- Freelancers only see jobs they were matched to by the AI engine
- Clients interact via web app OR WhatsApp — freelancers use web app only
- Clients connect their own social accounts (Facebook / Instagram / YouTube) and publish from Mint More
- Mint AI: multi-model AI system (text, image, video, captions, scripts) via OpenRouter — 400+ models

### Core Modules
| # | Module | Status |
|---|--------|--------|
| 1 | Backend Foundation | ✅ Complete |
| 2 | Authentication System | ✅ Complete |
| 3 | User Profile + KYC | ✅ Complete |
| 4A | Admin System + Marketplace Foundation | ✅ Complete |
| 4B | Job System + Marketplace Core | ✅ Complete |
| 4C | Proposal System + AI Matching | ✅ Complete |
| 4C-fix | Matching Engine — Intelligent Rebuild | ✅ Complete |
| 4C-pricing | Pricing Tiers + Market-Aware Matching | ✅ Complete |
| 4D | Negotiation + Assignment Loop | ✅ Complete |
| 4E | Auto Matching + Visibility Control | ✅ Complete |
| 5 | In-App Notification System (SSE + Redis) | ✅ Complete |
| 6 | Wallet + Escrow Payment System (Razorpay) | ✅ Complete |
| 7 | WhatsApp-Bridged Chat System | ✅ Complete |
| 8 | Social Media Integration + Publishing System | ✅ Complete |
| 9 | Mint AI — Multi-Model AI System | ✅ Complete |

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** PostgreSQL via Supabase (Session Pooler — IPv4)
- **Cache / Queue:** Redis + BullMQ
- **File Storage:** Supabase Storage
- **Real-time:** Server-Sent Events (SSE) + Redis pub/sub
- **Payments:** Razorpay
- **Messaging:** Meta WhatsApp Cloud API v19.0
- **Social Publishing:** Facebook Graph API v19, Instagram Graph API, YouTube Data API v3
- **AI:** OpenRouter (400+ models — text, image, video)

### Key Libraries
| Package | Purpose |
|---------|---------|
| `pg` | PostgreSQL pool |
| `ioredis` | Redis client + SSE pub/sub |
| `jsonwebtoken` | JWT tokens |
| `bcrypt` | Password hashing |
| `multer` | File upload (memory storage) |
| `@supabase/supabase-js` | Supabase Storage client |
| `razorpay` | Payment gateway SDK |
| `bullmq` | Job queue (social publishing + AI generations) |
| `@googleapis/youtube` | YouTube Data API v3 |
| `axios` | HTTP client for Meta/Google APIs |
| `form-data` | Multipart uploads |
| `helmet` | Security headers |
| `cors` | CORS |
| `compression` | Gzip |
| `winston` | Structured logging |
| `morgan` | HTTP request logging |
| `express-rate-limit` | Rate limiting |
| `uuid` | UUID generation |

---

## ⚙️ Environment Variables (Complete .env Reference)

```env
# ── SERVER ──────────────────────────────────────────
NODE_ENV=development
PORT=5000
API_VERSION=v1

# ── DATABASE (Supabase Session Pooler — IPv4) ────────
# CRITICAL: Always Session Pooler — NEVER db.xxxxx.supabase.co (IPv6)
DB_HOST=aws-1-ap-south-1.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.grnnqilqrzlnrtbfrpyx
DB_PASSWORD=your_database_password
DB_SSL=true

# ── REDIS ────────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ── SECURITY ─────────────────────────────────────────
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# ── LOGGING ──────────────────────────────────────────
LOG_LEVEL=debug

# ── JWT ──────────────────────────────────────────────
JWT_ACCESS_SECRET=your_64_byte_hex_secret
JWT_REFRESH_SECRET=your_64_byte_hex_secret_different
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ── BCRYPT ───────────────────────────────────────────
BCRYPT_SALT_ROUNDS=12

# ── SUPABASE STORAGE ──────────────────────────────────
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key

# ── FILE UPLOAD ───────────────────────────────────────
MAX_FILE_SIZE_MB=5
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf

# ── RAZORPAY ─────────────────────────────────────────
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# ── WHATSAPP (Meta Cloud API) ─────────────────────────
META_WA_ACCESS_TOKEN=your_permanent_system_user_token
META_WA_VERIFY_TOKEN=mintmore1
META_WA_API_VERSION=v19.0
META_APP_SECRET=your_meta_app_secret

# ── FACEBOOK / INSTAGRAM ─────────────────────────────
# Pending Meta Business Verification (applied — in review)
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_REDIRECT_URI=http://localhost:5000/api/v1/social/callback/facebook

# ── YOUTUBE (Google OAuth) ────────────────────────────
# Setup complete in Google Cloud Console
YOUTUBE_CLIENT_ID=your_google_oauth_client_id
YOUTUBE_CLIENT_SECRET=your_google_oauth_client_secret
YOUTUBE_REDIRECT_URI=http://localhost:5000/api/v1/social/callback/youtube

# ── FRONTEND ─────────────────────────────────────────
FRONTEND_URL=http://localhost:3000

# ── AI (OpenRouter) ───────────────────────────────────
OPENROUTER_API_KEY=sk-or-v1-your_openrouter_key
AI_TEXT_CREDIT_PER_1K_TOKENS=2
AI_IMAGE_CREDIT_BASE=10
AI_MAX_REQUESTS_PER_HOUR=20
```

> 🔑 Generate JWT secrets:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

---

## 🗄️ Database

### Connection (CRITICAL — IPv4 only network)
```
Host:  aws-1-ap-south-1.pooler.supabase.com
Port:  5432
User:  postgres.grnnqilqrzlnrtbfrpyx
SSL:   { rejectUnauthorized: false }
NEVER use db.xxxxx.supabase.co (IPv6 — causes ENOTFOUND)
```

### Supabase Project
- **Org:** mintmoremarketing's Org
- **Project:** Mint-more-saas
- **Email:** agency@mintmoremarketing.com

### Migrations
| File | Description | Status |
|------|-------------|--------|
| `001_create_users.sql` | Users table, enums, indexes, trigger | ✅ Done |
| `002_create_kyc.sql` | KYC submissions | ✅ Done |
| `003_marketplace_foundation.sql` | Jobs, proposals, assignments, categories | ✅ Done |
| `004_jobs_metadata.sql` | metadata JSONB on jobs | ✅ Done |
| `005_pricing_system.sql` | category_price_ranges, pricing_mode, price fields | ✅ Done |
| `006_active_jobs_count.sql` | active_jobs_count on users | ✅ Done |
| `007_negotiation_system.sql` | negotiations, rounds, matched_candidates, locking | ✅ Done |
| `008_notifications.sql` | notifications table, 15 types | ✅ Done |
| `009_wallet_system.sql` | wallets, transactions, escrow, withdrawals, razorpay_orders | ✅ Done |
| `010_chat_system.sql` | whatsapp_numbers, chat_rooms, messages, user_presence | ✅ Done |
| `011_wa_sessions.sql` | wa_sessions state machine | ✅ Done |
| `012_social_media.sql` | social_accounts, posts, post_media, post_platforms | ✅ Done |
| `013_ai_system.sql` | ai_models, ai_generations, ai_usage_log, ai_model_favourites | ✅ Done |
| `013_ai_video.sql` | ALTER ai_tool_type ADD 'video' + seed 13 video models | ✅ Done |

### Supabase Storage Buckets
| Bucket | Public | Purpose |
|--------|--------|---------|
| `avatars` | ✅ Yes | Profile pictures |
| `kyc-docs` | ❌ No | KYC documents (private) |
| `job-attachments` | ✅ Yes | Job files + AI-generated images/videos |

---

## 📁 Full Folder Structure

```
mint-more-backend/
├── src/
│   ├── config/
│   │   ├── env.js                              ✅
│   │   ├── database.js                         ✅ PostgreSQL pool (Session Pooler)
│   │   ├── redis.js                            ✅ ioredis
│   │   └── supabase.js                         ✅ Storage client
│   ├── db/migrations/
│   │   ├── 001–012 (all previous)              ✅
│   │   ├── 013_ai_system.sql                   ✅
│   │   └── 013_ai_video.sql                    ✅ (run in Supabase SQL Editor)
│   ├── middleware/
│   │   ├── authenticate.js                     ✅ JWT + authorize()
│   │   ├── errorHandler.js                     ✅
│   │   ├── rateLimiter.js                      ✅
│   │   ├── requestLogger.js                    ✅
│   │   ├── requireApproved.js                  ✅
│   │   ├── upload.js                           ✅ Multer
│   │   ├── sse.js                              ✅ notifications + chat + AI progress
│   │   └── rawBody.js                          ✅ Razorpay + WhatsApp webhooks
│   ├── modules/
│   │   ├── health/                             ✅
│   │   ├── auth/                               ✅
│   │   ├── profile/                            ✅
│   │   ├── kyc/                                ✅
│   │   ├── admin/                              ✅ calls adminListAllJobs
│   │   ├── categories/                         ✅
│   │   ├── jobs/                               ✅ auto-match + visibility
│   │   ├── proposals/                          ✅
│   │   ├── matching/                           ✅ scoring + pricing alignment
│   │   ├── negotiation/                        ✅ lock + 2-round + fallback
│   │   ├── notifications/                      ✅ 15 trigger types
│   │   ├── wallet/                             ✅ escrow + withdrawals
│   │   ├── payments/                           ✅ Razorpay
│   │   ├── chat/
│   │   │   ├── chat.routes.js                  ✅
│   │   │   ├── chat.controller.js              ✅
│   │   │   ├── chat.service.js                 ✅ WA bridge + rooms + presence
│   │   │   └── whatsapp.service.js             ✅ Meta Cloud API calls
│   │   ├── whatsapp/
│   │   │   ├── webhook.routes.js               ✅
│   │   │   ├── webhook.controller.js           ✅ sig verify + routing
│   │   │   └── conversation.service.js         ✅ full state machine
│   │   ├── social/
│   │   │   ├── social.routes.js                ✅
│   │   │   ├── social.controller.js            ✅
│   │   │   ├── social.service.js               ✅ OAuth + publish + analytics
│   │   │   ├── social.validator.js             ✅
│   │   │   ├── publishers/
│   │   │   │   ├── facebook.publisher.js       ✅
│   │   │   │   ├── instagram.publisher.js      ✅
│   │   │   │   └── youtube.publisher.js        ✅
│   │   │   └── queue/
│   │   │       ├── publish.queue.js            ✅ BullMQ queue
│   │   │       └── publish.worker.js           ✅ BullMQ worker
│   │   └── ai/
│   │       ├── ai.routes.js                    ✅ user + admin routes
│   │       ├── ai.controller.js                ✅ user + admin controllers
│   │       ├── ai.service.js                   ✅ generate + process + history
│   │       ├── ai.validator.js                 ✅
│   │       ├── admin.ai.service.js             ✅ model CRUD + analytics
│   │       ├── models/
│   │       │   ├── model.registry.js           ✅ DB-backed + in-memory cache
│   │       │   └── model.traffic.js            ✅ Redis traffic tracking
│   │       ├── providers/
│   │       │   └── openrouter.provider.js      ✅ text + image + video
│   │       └── queue/
│   │           ├── ai.queue.js                 ✅ BullMQ queue
│   │           └── ai.worker.js                ✅ BullMQ worker (concurrency 5)
│   └── app.js                                  ✅ all routers + all workers started
├── .env
├── package.json
└── server.js
```

---

## 🔌 API Routes (Complete)

### Base URL: `http://localhost:5000/api/v1`

#### Health
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/health` | None | Server + DB + Redis |

#### Auth
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/auth/register` | None | Register |
| POST | `/auth/login` | None | Login |
| POST | `/auth/refresh` | None | Rotate tokens |
| POST | `/auth/logout` | ✅ Bearer | Blacklist token |
| GET | `/auth/me` | ✅ Bearer | Own auth data |

#### Profile
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/profile/me` | ✅ Bearer | Full profile |
| PATCH | `/profile/me` | ✅ Bearer | Update |
| PATCH | `/profile/me/avatar` | ✅ Bearer | Upload avatar |
| GET | `/profile/me/pricing-guidance` | ✅ Freelancer | Market hints |
| GET | `/profile/:userId` | ✅ Bearer | Public profile |

#### KYC
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/kyc/status` | ✅ Bearer | Status + submissions |
| POST | `/kyc/basic` | ✅ Bearer | Basic KYC |
| POST | `/kyc/identity` | ✅ Bearer | Identity KYC (multipart) |
| POST | `/kyc/address` | ✅ Bearer | Address KYC (multipart) |
| GET | `/kyc/admin/pending` | ✅ Admin | Pending queue |
| PATCH | `/kyc/admin/review/:id` | ✅ Admin | Approve / reject |

#### Admin
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/admin/dashboard` | ✅ Admin | Platform stats |
| GET | `/admin/users` | ✅ Admin | User list |
| GET | `/admin/users/:id` | ✅ Admin | User detail |
| PATCH | `/admin/users/:id/approval` | ✅ Admin | Approve / suspend |
| PATCH | `/admin/users/:id/level` | ✅ Admin | Set freelancer level |
| GET | `/admin/categories` | ✅ Admin | All categories |
| POST | `/admin/categories` | ✅ Admin | Create category |
| PATCH | `/admin/categories/:id/toggle` | ✅ Admin | Toggle active |
| GET | `/admin/jobs` | ✅ Admin | All jobs |
| PATCH | `/admin/jobs/:id/status` | ✅ Admin | Update status |
| GET | `/admin/price-ranges` | ✅ Admin | Price ranges |
| PUT | `/admin/price-ranges/:categoryId` | ✅ Admin | Upsert range |

#### Categories
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/categories` | None | Active categories |
| GET | `/categories/:id/market-range` | None | Price range |

#### Jobs
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/jobs` | ✅ Client + Approved | Create → matching auto-triggers |
| POST | `/jobs/draft` | ✅ Client + Approved | Create draft |
| PATCH | `/jobs/:id/publish` | ✅ Client + Approved | Publish → matching triggers |
| PATCH | `/jobs/:id` | ✅ Client + Approved | Update draft |
| PATCH | `/jobs/:id/cancel` | ✅ Approved | Cancel |
| GET | `/jobs/my/summary` | ✅ Client | Status counts |
| GET | `/jobs` | ✅ Approved | Role-filtered list |
| GET | `/jobs/:id` | ✅ Approved | Single job |
| GET | `/jobs/admin/all` | ✅ Admin | All jobs |
| PATCH | `/jobs/admin/:id/status` | ✅ Admin | Update status |

#### Proposals
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/proposals/jobs/:jobId` | ✅ Freelancer | Submit |
| DELETE | `/proposals/:id` | ✅ Freelancer | Withdraw |
| GET | `/proposals/my` | ✅ Freelancer | Own proposals |
| GET | `/proposals/jobs/:jobId/client` | ✅ Client | Shortlisted |
| GET | `/proposals/jobs/:jobId/admin` | ✅ Admin | All proposals |
| PATCH | `/proposals/:id/review` | ✅ Admin | Shortlist / reject |

#### Matching
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/matching/jobs/:jobId/run` | ✅ Admin | Manual re-run |
| GET | `/matching/jobs/:jobId/preview` | ✅ Admin | Preview |
| GET | `/matching/jobs/:jobId/pool` | ✅ Admin | Full pool |

#### Negotiations
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/negotiations/jobs/:jobId/initiate` | ✅ Freelancer | Lock + open |
| PATCH | `/negotiations/jobs/:jobId/freelancer-respond` | ✅ Freelancer | Counter/accept/reject |
| PATCH | `/negotiations/jobs/:jobId/client-respond` | ✅ Client | Counter/accept/reject |
| PATCH | `/negotiations/jobs/:jobId/assignment-respond` | ✅ Freelancer | Accept/decline |
| GET | `/negotiations/jobs/:jobId/status` | ✅ Any | State |
| GET | `/negotiations/admin/pending-approvals` | ✅ Admin | Pending deals |
| POST | `/negotiations/admin/jobs/:jobId/approve-deal` | ✅ Admin | Approve |
| POST | `/negotiations/admin/jobs/:jobId/reject-deal` | ✅ Admin | Reject |

#### Notifications
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/notifications/stream` | ✅ `?token=` | SSE stream |
| GET | `/notifications` | ✅ Bearer | List |
| GET | `/notifications/unread-count` | ✅ Bearer | Badge count |
| PATCH | `/notifications/read-all` | ✅ Bearer | Mark all read |
| PATCH | `/notifications/:id/read` | ✅ Bearer | Mark one read |
| POST | `/notifications/admin/broadcast` | ✅ Admin | Broadcast |

#### Wallet
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/wallet` | ✅ Bearer | Balance + recent txns |
| GET | `/wallet/transactions` | ✅ Bearer | History |
| POST | `/wallet/withdraw` | ✅ Freelancer | Request payout |
| GET | `/wallet/admin/stats` | ✅ Admin | Platform overview |
| GET | `/wallet/admin/withdrawals` | ✅ Admin | Pending queue |
| PATCH | `/wallet/admin/withdrawals/:id` | ✅ Admin | Approve/reject |
| POST | `/wallet/admin/jobs/:jobId/complete` | ✅ Admin | Complete → release escrow |
| POST | `/wallet/admin/jobs/:jobId/cancel` | ✅ Admin | Cancel → refund escrow |
| POST | `/wallet/admin/users/:userId/adjust` | ✅ Admin | Manual balance adjust |

#### Payments
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/payments/topup/order` | ✅ Bearer | Create Razorpay order |
| POST | `/payments/topup/verify` | ✅ Bearer | Verify payment (fallback) |
| POST | `/payments/webhook/razorpay` | None (sig) | Razorpay webhook |

#### Chat
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/chat/rooms` | ✅ Bearer | My rooms |
| GET | `/chat/rooms/:id` | ✅ Bearer | Room detail |
| GET | `/chat/rooms/:id/messages` | ✅ Bearer | Messages |
| POST | `/chat/rooms/:id/messages` | ✅ Bearer | Send (bridges to WA) |
| POST | `/chat/presence/online` | ✅ Bearer | Mark online |
| POST | `/chat/presence/offline` | ✅ Bearer | Mark offline |
| GET | `/chat/presence/:userId` | ✅ Bearer | Check presence |
| GET | `/chat/admin/wa-numbers` | ✅ Admin | MM WA numbers |
| POST | `/chat/admin/wa-numbers` | ✅ Admin | Add/update number |

#### WhatsApp Webhook
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/whatsapp/webhook` | None | Meta verification |
| POST | `/whatsapp/webhook` | None (sig) | Incoming events |
| POST | `/whatsapp/test/simulate-message` | None (dev) | Local testing |

#### Social Media
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/social/connect/:platform` | `?token=` | Start OAuth |
| GET | `/social/callback/:platform` | None | OAuth callback |
| GET | `/social/accounts` | ✅ Bearer | Connected accounts |
| DELETE | `/social/accounts/:id` | ✅ Bearer | Disconnect |
| GET | `/social/posts` | ✅ Bearer | List posts |
| POST | `/social/posts` | ✅ Approved | Create draft |
| GET | `/social/posts/:id` | ✅ Bearer | Post detail |
| POST | `/social/posts/:id/media` | ✅ Approved | Add media |
| POST | `/social/posts/:id/publish` | ✅ Approved | Publish/schedule |
| POST | `/social/posts/:id/cancel` | ✅ Bearer | Cancel |
| GET | `/social/posts/:id/analytics` | ✅ Bearer | Pull analytics |

#### Mint AI
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/ai/models` | ✅ Bearer | All models with live traffic |
| GET | `/ai/models/traffic/:openrouterId` | ✅ Bearer | Single model live traffic |
| POST | `/ai/generate` | ✅ Bearer | Create generation (all tools) |
| GET | `/ai/generations` | ✅ Bearer | History |
| GET | `/ai/generations/:id` | ✅ Bearer | Single result |
| GET | `/ai/usage` | ✅ Bearer | Credits + rate limit |
| GET | `/ai/admin/stats` | ✅ Admin | Full AI analytics dashboard |
| GET | `/ai/admin/models/:modelId/stats` | ✅ Admin | Single model analytics |
| GET | `/ai/admin/openrouter/browse` | ✅ Admin | Browse all 400+ OpenRouter models |
| POST | `/ai/admin/models` | ✅ Admin | Add model to platform |
| PATCH | `/ai/admin/models/:modelId` | ✅ Admin | Edit model settings |
| PATCH | `/ai/admin/models/:modelId/toggle` | ✅ Admin | Enable/disable model |

---

## 🤖 Mint AI System (Phase 9)

### Overview
Multi-model AI content generation powered entirely by OpenRouter (400+ models). Admin controls everything from the panel — add models, set pricing, write system prompts, enable/disable, view analytics.

### Supported Tool Types
| Tool | Description | Models |
|------|-------------|--------|
| `text` | Blog posts, ad copy, emails, articles | All text models |
| `caption` | Social media captions + hashtags | All text models |
| `video_script` | Scripts for Reels, Shorts, ads | All text models |
| `repurpose` | 1 piece of content → 5 formats | All text models |
| `image` | Marketing graphics, thumbnails, product images | Image-capable models (GPT-4o etc.) |
| `video` | Text-to-video and image-to-video | 13 dedicated video models |

### Video Generation Models (13 total)
| Model | Provider | Tier | Best For |
|-------|----------|------|---------|
| Google Veo 3.1 | Google | Premium | 1080p, audio, 140s narratives |
| Google Veo 3.1 Fast | Google | Standard | Speed + quality balance |
| Google Veo 3.1 Lite | Google | Free | Short-form, rapid iteration |
| OpenAI Sora 2 Pro | OpenAI | Premium | Physics-accurate, multi-shot |
| ByteDance Seedance 2.0 | ByteDance | Premium | Character consistency |
| ByteDance Seedance 2.0 Fast | ByteDance | Standard | Faster, lower cost |
| ByteDance Seedance 1.5 Pro | ByteDance | Premium | Lip-sync, multilingual audio |
| Alibaba Wan 2.7 | Alibaba | Standard | Image-to-video, first/last frame |
| Alibaba Wan 2.6 | Alibaba | Premium | 1080p 24fps, native audio |
| Kling Video O1 | Kuaishou | Standard | Cinematic, 5-10s clips |
| MiniMax Hailuo 2.3 | MiniMax | Standard | Realistic motion, characters |

### Admin AI Dashboard Shows
- Total generations (period selectable: 7/30 days)
- Per-model breakdown: requests, completions, failures, credits consumed, avg response time, error rate %
- Per-tool breakdown: which tools are most used
- Top 10 users by usage
- Recent failures (last 24h) with error messages
- Live Redis traffic for all models (load %, queue depth, estimated wait)
- All models with enable/disable toggle, pricing editor, system prompt editor

### Model Management from Admin Panel
```
GET  /ai/admin/openrouter/browse
→ Browse all 400+ models on OpenRouter
→ Each shows: already_added: true/false, pricing, context_window

POST /ai/admin/models
→ Add any model from OpenRouter to Mint More
→ Set: supported_tools, tier, cost, tags, system_prompts per tool, sort order

PATCH /ai/admin/models/:id
→ Edit anything: pricing, tools, system prompts, trending flag

PATCH /ai/admin/models/:id/toggle
→ Instantly enable or disable a model
→ Busts in-memory cache immediately
```

### Traffic-Aware System
```
Each model tracked in Redis:
  active_requests  → how many in progress right now
  queue_depth      → how many waiting
  avg_response_ms  → rolling average (last 20 requests)
  error_rate       → errors / hourly requests × 100
  hourly_requests  → total in last hour (trending signal)

Status labels:
  idle     (0% load)   → green   → 0 min wait
  low      (<30%)      → green   → 0 min wait
  moderate (30-60%)    → yellow  → 1 min wait
  busy     (60-85%)    → orange  → 2 min wait
  high     (>85%)      → red     → 5 min wait
```

### Failover Logic
```
Primary model fails or times out
        ↓
getFreeModels(tool_type) → list all free models for this tool
        ↓
getBestFreeModel() → pick lowest load from Redis traffic data
        ↓
Retry with free model transparently
        ↓
generation.used_failover = true
credits_used = 0 (never charge for failover)
```

### Generation Flow
```
POST /ai/generate → validate → rate limit check → credit preflight
        ↓
Insert ai_generations row (status: queued)
        ↓
BullMQ enqueues job
        ↓
Worker picks up → status: processing → SSE push
        ↓
OpenRouter API call (text/image/video)
        ↓
For video: poll until complete (max 10 min)
For image: download URL → upload to Supabase Storage
        ↓
status: completed → SSE push → deduct credits
        ↓
Log to ai_usage_log + update model stats
```

### SSE Progress Events
```
data: {"type":"ai_progress","status":"processing","generationId":"...","model_id":"..."}
data: {"type":"ai_progress","status":"completed","generationId":"...","result_text":"..."}
data: {"type":"ai_progress","status":"failed","generationId":"...","error":"..."}
```

### Rate Limiting
- Default: 20 requests/hour per user
- Configurable via `AI_MAX_REQUESTS_PER_HOUR` env var
- Tracked in Redis with 1-hour TTL (auto-resets)
- Returns 429 with minutes until reset

---

## 📱 Social Media System (Phase 8)

### Client Flow
```
Click "Connect Facebook/Instagram" → OAuth redirect → client logs in with their OWN account
→ tokens saved per user_id → publish to their accounts from Mint More
```

### Platform Requirements
| Platform | Client Needs |
|----------|-------------|
| Facebook | FB account + at least one Page they manage |
| Instagram | Instagram Business/Creator + connected to FB Page |
| YouTube | Google account + YouTube channel |

### Publishing Flow
```
Create draft → add media → publish
        ↓
Per-platform status rows created
        ↓
BullMQ job (immediate or scheduled delay)
        ↓
Worker: publish to all platforms via Promise.allSettled
(one failure doesn't block others)
        ↓
Per-platform: published / failed
```

### External Setup Status
| Service | Status |
|---------|--------|
| Meta Business Verification | ⏳ In Review |
| Facebook/Instagram permissions | ⏳ After verification |
| Google Cloud + YouTube API | ✅ Setup complete |
| YouTube OAuth consent screen | ✅ Configured |
| YouTube OAuth client ID/secret | ✅ Created — add to .env |

---

## 🟢 WhatsApp System (Phase 7)

### Architecture
```
Client → MM Main Number
        ↓ state machine
new_contact    → welcome menu (1-6 service options)
awaiting_brief → collect project brief
transferring   → generate MMSTART-XXXX token → send wa.me link

Client taps link → MM Category Number
        ↓
awaiting_activation → validate token → activate
                    → create job + trigger matching
active_job_chat     → route to chat room
                    → freelancer replies from web app (anonymous)
job_completed       → redirect to main number
```

### Handoff Token System
- Format: `MMSTART-XXXXXX` (hex, uppercase)
- Valid: 30 minutes, single-use
- Embedded in `wa.me` deep link with prefilled text
- Category number blocks ALL messages that aren't a valid unexpired token

### MM Numbers Status
| Number | Purpose | Status |
|--------|---------|--------|
| Meta test `+1 415 523 8886` | MM Main (dev) | ✅ Seeded (ID: `1092380853958380`) |
| MM Videography | Video projects | ⏳ Need fresh SIM |
| MM Design | Design projects | ⏳ Need fresh SIM |
| MM Content | Content projects | ⏳ Need fresh SIM |

### Meta App Status
| Item | Status |
|------|--------|
| App created + published (live mode) | ✅ |
| System user permanent token | ✅ |
| App secret | ✅ |
| Webhook verified + messages subscribed | ✅ |
| Signature verification working | ✅ |
| Test number seeded in DB | ✅ |
| Business verification | ⏳ In Review |
| Real SIM numbers (need 2 fresh SIMs) | ⏳ Pending |

---

## 💰 Wallet System (Phase 6)

### Transaction Types
| Type | Direction | Trigger |
|------|-----------|---------|
| `topup` | +balance | Razorpay webhook |
| `escrow_hold` | -balance +escrow | Admin approves deal |
| `escrow_release` | -escrow +freelancer | Job completed |
| `escrow_refund` | -escrow +client | Job cancelled |
| `withdrawal` | -balance | Freelancer requests payout |
| `withdrawal_rejected` | +balance | Admin rejects |
| `adjustment` | ±balance | Admin manual (testing/corrections) |

### Escrow Flow
```
Client balance ──(deal approved)──→ Client escrow_balance
                                           │
                              Job complete │  Job cancelled
                                           ▼       ▼
                                 Freelancer      Client
                                  balance        balance
```

### Manual Credit (Testing)
```bash
POST /wallet/admin/users/:userId/adjust
{ "amount": 10000, "note": "Test credit" }
```

---

## 🔔 Notification System (Phase 5)

### 15 Types
| Type | Recipients |
|------|-----------|
| `job_matched` | Matched freelancers |
| `negotiation_initiated` | Client |
| `negotiation_countered` | Other party |
| `negotiation_accepted` | Both parties |
| `negotiation_rejected` | Both parties |
| `deal_pending_admin` | All admins |
| `deal_approved` | Freelancer + Client |
| `deal_rejected_by_admin` | Freelancer + Client |
| `assignment_created` | Freelancer |
| `assignment_accepted` | Client + All admins |
| `assignment_declined` | Client + All admins |
| `kyc_approved` | User |
| `kyc_rejected` | User |
| `admin_broadcast` | All / by role |
| `system` | Any user |

### SSE Events (all delivered via single stream)
```
Notification:  data: {"type":"notification","payload":{...}}
Chat message:  data: {"type":"chat_message","roomId":"...","message":{...}}
AI progress:   data: {"type":"ai_progress","generationId":"...","status":"..."}
Keepalive:     : ping  (every 30s)
```

---

## 🧠 Matching Engine (Phase 4C)

### Scoring Formula
```
base = skill(0.40) + level(0.25) + rating(0.20) + fairness(0.15)
× workload_multiplier (0.5–1.0 based on active_jobs_count)
+ new_freelancer_boost (+0.10 if 0 jobs completed)
+ idle_bonus (+0.00 to +0.15 based on days since last assigned)
+ kyc_bonus (+0.05 if fully verified)
+ profile_bonus (+0.05 if bio+skills+avatar+level all set)
+ pricing_contribution (max 0.15 from pricing alignment)
= clamped to [0, 1]
```

### Constants
| Constant | Value |
|----------|-------|
| MAX_ACTIVE_JOBS | 5 (hard disqualifier) |
| MAX_JOBS_REFERENCE | 10 (fairness denominator) |
| NEW_FREELANCER_BOOST | +0.10 |
| TOP_N_CANDIDATES | 10 |
| MAX_NEGOTIATION_ROUNDS | 2 |

### active_jobs_count Lifecycle
| Event | Change |
|-------|--------|
| Admin approves deal | +1 |
| Freelancer declines assignment | -1 |
| Job completed | -1 |
| Job cancelled (assigned/in_progress) | -1 |

---

## 👁️ Job Visibility Rules

| Role | GET /jobs | GET /jobs/:id |
|------|-----------|---------------|
| admin | All jobs, all statuses | Any |
| client | Own jobs only | Own → 404 otherwise |
| freelancer | Only in job_matched_candidates | Only if matched → **404** |

> **404 not 403** — prevents information leakage about job existence.

---

## 🗄️ Complete Database Schema

### users
```sql
id, email, phone, password_hash, role,
full_name, avatar_url, bio, skills, gender, date_of_birth,
address_city, address_state, country,
is_active, is_approved, approved_at, approved_by,
is_email_verified, kyc_status, kyc_level,
freelancer_level, level_set_by_admin, is_available,
jobs_completed_count,   -- historical (fairness scoring)
active_jobs_count,      -- current workload (eligibility)
average_rating,
price_min, price_max, pricing_visibility,
whatsapp_number, wa_verified,
refresh_token, last_login_at, created_at, updated_at
```

### jobs
```sql
id, client_id, category_id,
title, description, requirements, attachments,
budget_type, budget_amount, currency, pricing_mode,
required_level, required_skills, deadline, metadata,
status (draft|open|matching|locked|pending_admin_approval
        |assigned|in_progress|completed|cancelled),
matched_at, match_method,
active_freelancer_id, backup_freelancer_id,
locked_at, negotiation_rounds,
deal_approved_by, deal_approved_at,
admin_note, assigned_by, assigned_at,
created_at, updated_at
```

### wallets
```sql
id, user_id (UNIQUE), balance, escrow_balance, currency
CONSTRAINT: balance >= 0, escrow_balance >= 0
Auto-created via trigger for every new user
```

### transactions (immutable — INSERT only, never UPDATE/DELETE)
```sql
id, wallet_id, user_id, type, status,
amount, currency, balance_after, escrow_after,
reference_id, reference_type,
description, metadata, created_at
```

### escrow_records
```sql
id, job_id (UNIQUE), client_id, freelancer_id,
amount, currency, status (held|released|refunded|disputed),
held_at, released_at, refunded_at,
hold_tx_id, release_tx_id, refund_tx_id,
admin_note, created_at, updated_at
```

### withdrawals
```sql
id, user_id, wallet_id, amount, currency,
status (pending|approved|rejected|paid),
account_name, account_number, ifsc_code, upi_id,
admin_note, reviewed_by, reviewed_at, paid_at,
transaction_id, created_at, updated_at
```

### razorpay_orders
```sql
id, user_id, wallet_id,
razorpay_order_id (UNIQUE), razorpay_payment_id, razorpay_signature,
amount, amount_paise, currency,
status (created|paid|failed|refunded),
webhook_verified, metadata, created_at, updated_at
```

### whatsapp_numbers
```sql
id, category_id (NULL = main number),
display_name, phone_number, waba_phone_id (UNIQUE),
is_active, created_at, updated_at
```

### chat_rooms
```sql
id, job_id (UNIQUE), client_id, freelancer_id,
client_wa_number, mm_wa_number_id, whatsapp_thread_id,
is_active, last_message_at, last_message_preview,
created_at, updated_at
```

### messages
```sql
id, room_id, sender_id, sender_role (client|freelancer|system),
content, channel (web|whatsapp),
wa_message_id, wa_status,
attachment_url, attachment_type,
read_by_client, read_by_freelancer,
read_at_client, read_at_freelancer,
is_deleted, created_at
```

### wa_sessions
```sql
id, client_wa_number, mm_phone_id,
session_type (main|category), state (wa_session_state enum),
selected_service, project_brief,
category_id, job_id,
handoff_token (UNIQUE), handoff_expires_at, handoff_used,
user_id, last_message_at, created_at, updated_at
UNIQUE(client_wa_number, mm_phone_id)
```

### social_accounts
```sql
id, user_id, platform (facebook|instagram|youtube),
platform_user_id, platform_username, platform_name, platform_avatar_url,
page_id, page_name, instagram_account_id,
access_token, refresh_token, token_expires_at, token_scope,
is_active, last_used_at, last_error,
created_at, updated_at
UNIQUE(user_id, platform, platform_user_id)
```

### social_posts
```sql
id, user_id, title, caption, hashtags[], mentions[],
content_type (text|image|video|carousel|reel|short|story),
status (draft|scheduled|publishing|published|failed|cancelled),
publish_at, published_at,
target_platforms social_platform[],
queue_job_id, source_job_id,
metadata, created_at, updated_at
```

### social_post_media
```sql
id, post_id, user_id,
media_url, media_type, mime_type,
file_size_bytes, duration_seconds, width, height,
thumbnail_url, alt_text, sort_order, created_at
```

### social_post_platforms
```sql
id, post_id, social_account_id, platform,
status (pending|publishing|published|failed|skipped),
platform_post_id, platform_post_url,
platform_title, platform_description, privacy_status,
error_message, retry_count, last_retry_at,
views_count, likes_count, comments_count, shares_count, reach_count,
analytics_pulled_at, published_at,
created_at, updated_at
UNIQUE(post_id, platform)
```

### ai_models (admin-managed — not hardcoded)
```sql
id, openrouter_id (UNIQUE),
name, description, provider_name,
supported_tools ai_tool_type[],    -- text|image|video|caption|video_script|repurpose
tier (free|standard|premium),
cost_per_1k_tokens,                -- 0 = free
context_window,
tags text[], is_trending, is_active, sort_order,
system_prompts JSONB,              -- per-tool system prompt overrides
avg_response_ms, total_requests, total_failures,
added_by, created_at, updated_at
```

### ai_generations
```sql
id, user_id, ai_model_id,
tool_type, openrouter_id, model_name,
prompt, parameters JSONB,
status (queued|processing|completed|failed|cancelled),
result_text, result_url, result_metadata JSONB,
queued_at, started_at, completed_at, duration_ms,
credits_used, tokens_input, tokens_output,
error_message, retry_count,
used_failover, failover_model,
queue_job_id, source_post_id, source_job_id,
created_at, updated_at
```

### ai_usage_log
```sql
id, user_id, ai_model_id, generation_id,
tool_type, openrouter_id,
credits_used, tokens_input, tokens_output,
created_at
```

### notifications
```sql
id, user_id, type (15 types),
title, body, entity_type, entity_id,
data JSONB, is_read, read_at, created_at
```

### negotiations
```sql
id, job_id, freelancer_id, client_id,
status (pending|active|agreed|failed|admin_approved|cancelled),
current_round, max_rounds (2),
agreed_price, agreed_days,
admin_note, approved_by, approved_at,
created_at, updated_at
UNIQUE(job_id, freelancer_id)
```

### job_matched_candidates
```sql
id, job_id, freelancer_id,
rank, score, tier, notify_at, notified_at,
position (primary|backup|candidate),
created_at
UNIQUE(job_id, freelancer_id)
```

### job_assignments
```sql
id, job_id, freelancer_id, assigned_by, proposal_id,
status (pending_acceptance|accepted|declined|completed|cancelled),
freelancer_note, responded_at, started_at, completed_at,
completed_at_confirmed, completion_note, admin_note,
created_at, updated_at
```

---

## 🔧 Bug Fixes Log

### Phase 4E — FOR UPDATE + LEFT JOIN
```js
// CORRECT — lock row only, never with JOIN
await client.query(`SELECT * FROM jobs WHERE id = $1 FOR UPDATE`, [jobId]);
```

### Phase 4E — admin.routes.js function name
```js
router.get('/jobs', jobController.adminListAllJobs); // not adminListJobs
```

### Phase 7 — rawBody Buffer
```js
// Buffer concatenation (not string += chunk)
let data = Buffer.alloc(0);
req.on('data', (chunk) => { data = Buffer.concat([data, chunk]); });
req.on('end', () => { req.rawBody = data.toString('utf8'); next(); });
```

---

## 🔐 Auth System

- Access Token: JWT 15min — `JWT_ACCESS_SECRET`
- Refresh Token: JWT 7d — stored in DB, rotated on every use
- Logout: Redis blacklist (20min TTL) + DB refresh cleared
- RBAC: `authenticate` + `authorize('admin'|'freelancer'|'client')`
- Platform Gate: `requireApproved` middleware
- Token Payload: `{ sub, email, role, iat, exp }`

---

## 🏗️ Key Architecture Decisions

| Decision | Reason |
|----------|--------|
| Session Pooler (IPv4) | Network only supports IPv4 |
| SQL fetches only `role = 'freelancer'` in matching | All filtering in JS — debuggable, transparent |
| Immutable transaction ledger (INSERT only) | Full audit trail, tamper-proof |
| `balance` + `escrow_balance` separate | Locked money is not spendable |
| `FOR UPDATE` on wallet rows | Prevents concurrent double-spend |
| Webhooks before `express.json()` | Razorpay + WA need raw body for signature |
| BullMQ for social publishing | Publishing takes 2–60s — must be async |
| BullMQ for AI (concurrency 5) | AI calls take 3s–10min — cannot block HTTP |
| `Promise.allSettled` for multi-platform | Partial success better than total failure |
| AI models in DB (not hardcoded) | Admin adds/removes/edits any of 400+ models without code deploy |
| In-memory model cache 5min TTL | Fast reads — busted immediately on admin edit |
| Credits deducted AFTER success | Never charge for failed generations |
| Failover to lowest-load free model | 100% uptime for AI — transparent to user |
| Traffic in Redis TTL keys | Auto-expiring, sub-ms reads for UI polling |
| Video stored in Supabase (not OpenRouter URL) | OpenRouter URLs expire after hours |
| WA state machine per session | Each client conversation fully independent |
| Handoff token single-use + 30min TTL | Security — cannot reuse or share |
| Freelancer always anonymous to client | Client sees "Mint More" — never knows who freelancer is |
| 404 not 403 for unmatched jobs | 403 leaks job existence — 404 is safer |
| `setImmediate` for all triggers | Non-blocking — failures never affect main business logic |

---

## 📋 Resume Context (paste into new Claude chat)

```
You are a senior full-stack engineer continuing "Mint More" — a controlled matchmaking SaaS for Indian creative businesses.

TECH: Node.js + Express + PostgreSQL (Supabase Session Pooler) + Redis + BullMQ +
      Supabase Storage + SSE + Razorpay + Meta WhatsApp Cloud API +
      Facebook/Instagram Graph API + YouTube Data API v3 + OpenRouter (AI)

DB: host=aws-1-ap-south-1.pooler.supabase.com port=5432 user=postgres.grnnqilqrzlnrtbfrpyx SSL=true

ALL 9 PHASES COMPLETE:
- Phase 1:          Foundation (server, DB pool, Redis, middleware, health)
- Phase 2:          Auth (JWT 15m + refresh 7d, bcrypt, Redis blacklist, RBAC)
- Phase 3:          Profile + KYC (3-level, Supabase Storage, atomic approval)
- Phase 4A:         Admin (approval, freelancer levels, categories, dashboard)
- Phase 4B:         Jobs (lifecycle, role visibility, metadata, pricing_mode)
- Phase 4C:         Matching (scoring, tier notifications, pricing alignment)
- Phase 4C-fix:     SQL role=freelancer only, ALL filters in JS
- Phase 4C-pricing: category_price_ranges, market guidance, pricing score
- Phase 4D:         Negotiation (lock, 2-round, fallback, admin approval, assignment)
- Phase 4E:         Auto matching + visibility (404 for unmatched freelancers)
- Phase 5:          In-app notifications (SSE + Redis + 15 trigger types)
- Phase 6:          Wallet + Escrow (Razorpay, escrow hold/release/refund, withdrawals)
- Phase 7:          WhatsApp-bridged chat (state machine, handoff tokens, anonymous freelancer)
- Phase 8:          Social publishing (FB/IG/YT OAuth, BullMQ scheduling, analytics)
- Phase 9:          Mint AI (OpenRouter 400+ models, text/image/video, admin panel, traffic)

KEY RULES:
- NOT bidding — controlled matchmaking + structured negotiation
- Matching: SQL = role=freelancer only. All eligibility/pricing in JS
- rank 1 → position=primary → jobs.active_freelancer_id
- rank 2 → position=backup → jobs.backup_freelancer_id
- FOR UPDATE never with LEFT JOIN
- active_jobs_count = current workload; jobs_completed_count = historical
- Max negotiation rounds = 2
- Escrow: held on deal approval, released on complete, refunded on cancel
- Transactions: immutable INSERT-only ledger
- Webhooks (Razorpay + WA) mounted BEFORE express.json() — need raw body
- BullMQ workers: startPublishWorker() + startAIWorker() both started in app.js
- AI models stored in DB (ai_models table), NOT hardcoded — admin manages all
- AI model cache: 5min in-memory, busted on every admin edit (bustModelCache())
- AI credits deducted AFTER success only — never for failed/failover
- AI failover: on primary failure → getBestFreeModel() → lowest-load free model
- Video generation: polls OpenRouter until complete (max 10 min), stores in Supabase
- Social: each client connects their OWN accounts via OAuth — tokens per user_id
- WA: MMSTART-XXXX token is only valid input on category number (awaiting_activation)
- WA: freelancer always anonymous — shown as "Mint More" to client
- Notifications: in-app SSE only (no WA/email for freelancers)
- requireApproved on all marketplace routes
- Response: { success, message, data } via apiResponse.js
- AppError for operational errors
- admin.routes.js uses jobController.adminListAllJobs (not adminListJobs)
- 404 not 403 for unmatched freelancer jobs

EXTERNAL STATUS:
- Meta Business Verification: IN REVIEW
- WA test number +1 415 523 8886 (ID: 1092380853958380) seeded as MM Main
- WA real numbers: need 2 fresh SIMs
- YouTube OAuth: setup complete in Google Cloud Console
- OpenRouter: needs API key from openrouter.ai (free $5 credit to start)

NEXT: All core phases complete. Possible next steps:
- Deploy to production (VPS / Railway / Render)
- Frontend integration
- WhatsApp real number testing (after getting SIMs)
- Meta Business Verification follow-up (for FB/IG social publishing)
- Admin dashboard UI
- Performance optimization / caching layer
```