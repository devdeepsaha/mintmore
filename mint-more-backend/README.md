# 🌿 Mint More — SaaS Platform
### Master Project README — Progress Tracker & Context Document
> **Purpose:** Tracks every phase, decision, config, and file in the Mint More backend.
> Paste the resume block at the bottom into a new Claude chat to continue exactly where you left off.

---

## 🧠 Project Summary

**Mint More** is a production-level controlled matchmaking + negotiation SaaS platform.
**NOT** an open bidding marketplace — uses structured negotiation with admin oversight.
Freelancers only see jobs they were matched to by the engine.
Clients interact via web app OR WhatsApp. Freelancers use web app only.
Clients connect their own social accounts (Facebook/Instagram/YouTube) and publish content directly from Mint More.

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
| 9 | AI Tools Integration | 🔲 Not Started |

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
- **Messaging:** Meta WhatsApp Cloud API
- **Social Publishing:** Facebook Graph API v19, Instagram Graph API, YouTube Data API v3

### Integrations (Planned)
- **AI Models:** OpenRouter / Replicate

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
| `bullmq` | Job queue (scheduled publishing + AI jobs) |
| `@googleapis/youtube` | YouTube Data API v3 |
| `axios` | HTTP client for Meta/Google APIs |
| `form-data` | Multipart form data for media uploads |
| `helmet` | Security headers |
| `cors` | CORS |
| `compression` | Gzip responses |
| `winston` | Structured logging |
| `morgan` | HTTP request logging |
| `express-rate-limit` | Rate limiting |
| `uuid` | UUID generation |

---

## ⚙️ Environment Variables (Full .env Reference)

```env
# ── SERVER ──────────────────────────────────────────
NODE_ENV=development
PORT=5000
API_VERSION=v1

# ── DATABASE (Supabase Session Pooler — IPv4) ────────
# CRITICAL: Always use Session Pooler — NOT db.xxxxx.supabase.co (IPv6)
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
# Waiting for Meta Business Verification (applied — in review)
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_REDIRECT_URI=http://localhost:5000/api/v1/social/callback/facebook

# ── YOUTUBE (Google OAuth) ────────────────────────────
# Setup complete — awaiting Client ID + Secret from Google Cloud Console
YOUTUBE_CLIENT_ID=your_google_oauth_client_id
YOUTUBE_CLIENT_SECRET=your_google_oauth_client_secret
YOUTUBE_REDIRECT_URI=http://localhost:5000/api/v1/social/callback/youtube

# ── FRONTEND URL ──────────────────────────────────────
FRONTEND_URL=http://localhost:3000

# ── AI (Phase 9) ─────────────────────────────────────
# OPENROUTER_API_KEY=
# REPLICATE_API_TOKEN=
```

---

## 🗄️ Database

### Connection Policy (CRITICAL)
> ⚠️ IPv4-only network — always use Session Pooler host.
> NEVER use `db.xxxxx.supabase.co` (IPv6).

```
Host:  aws-1-ap-south-1.pooler.supabase.com
Port:  5432
User:  postgres.grnnqilqrzlnrtbfrpyx
SSL:   { rejectUnauthorized: false }
```

### Supabase Project Info
- **Org:** mintmoremarketing's Org
- **Project:** Mint-more-saas
- **Email:** agency@mintmoremarketing.com

### Migrations
| File | Description | Status |
|------|-------------|--------|
| `001_create_users.sql` | Users table, enums, indexes, trigger | ✅ Done |
| `002_create_kyc.sql` | KYC submissions table | ✅ Done |
| `003_marketplace_foundation.sql` | Jobs, proposals, assignments, categories | ✅ Done |
| `004_jobs_metadata.sql` | metadata JSONB on jobs | ✅ Done |
| `005_pricing_system.sql` | category_price_ranges, pricing_mode, freelancer price fields | ✅ Done |
| `006_active_jobs_count.sql` | active_jobs_count on users | ✅ Done |
| `007_negotiation_system.sql` | negotiations, rounds, matched_candidates, locking fields | ✅ Done |
| `008_notifications.sql` | notifications table, 15 notification types | ✅ Done |
| `009_wallet_system.sql` | wallets, transactions, escrow, withdrawals, razorpay_orders | ✅ Done |
| `010_chat_system.sql` | whatsapp_numbers, chat_rooms, messages, user_presence | ✅ Done |
| `011_wa_sessions.sql` | wa_sessions state machine table | ✅ Done |
| `012_social_media.sql` | social_accounts, social_posts, post_media, post_platforms | ✅ Done |

### Supabase Storage Buckets
| Bucket | Public | Purpose |
|--------|--------|---------|
| `avatars` | ✅ Yes | User profile pictures |
| `kyc-docs` | ❌ No | KYC documents (private) |
| `job-attachments` | ✅ Yes | Job brief files |

---

## 📁 Full Folder Structure

```
mint-more-backend/
├── src/
│   ├── config/
│   │   ├── env.js                              ✅
│   │   ├── database.js                         ✅
│   │   ├── redis.js                            ✅
│   │   └── supabase.js                         ✅
│   ├── db/migrations/
│   │   ├── 001–011 (previous)                  ✅
│   │   └── 012_social_media.sql                ✅
│   ├── middleware/
│   │   ├── authenticate.js                     ✅
│   │   ├── errorHandler.js                     ✅
│   │   ├── rateLimiter.js                      ✅
│   │   ├── requestLogger.js                    ✅
│   │   ├── requireApproved.js                  ✅
│   │   ├── upload.js                           ✅
│   │   ├── sse.js                              ✅ notifications + chat channels
│   │   └── rawBody.js                          ✅ Razorpay + WhatsApp webhooks
│   ├── modules/
│   │   ├── health/                             ✅
│   │   ├── auth/                               ✅
│   │   ├── profile/                            ✅
│   │   ├── kyc/                                ✅
│   │   ├── admin/                              ✅
│   │   ├── categories/                         ✅
│   │   ├── jobs/                               ✅
│   │   ├── proposals/                          ✅
│   │   ├── matching/                           ✅
│   │   ├── negotiation/                        ✅
│   │   ├── notifications/                      ✅
│   │   ├── wallet/                             ✅
│   │   ├── payments/                           ✅
│   │   ├── chat/
│   │   │   ├── chat.routes.js                  ✅
│   │   │   ├── chat.controller.js              ✅
│   │   │   ├── chat.service.js                 ✅
│   │   │   └── whatsapp.service.js             ✅
│   │   ├── whatsapp/
│   │   │   ├── webhook.routes.js               ✅
│   │   │   ├── webhook.controller.js           ✅
│   │   │   └── conversation.service.js         ✅ full state machine
│   │   └── social/
│   │       ├── social.routes.js                ✅
│   │       ├── social.controller.js            ✅
│   │       ├── social.service.js               ✅ OAuth + publishing + analytics
│   │       ├── social.validator.js             ✅
│   │       ├── publishers/
│   │       │   ├── facebook.publisher.js       ✅
│   │       │   ├── instagram.publisher.js      ✅
│   │       │   └── youtube.publisher.js        ✅
│   │       └── queue/
│   │           ├── publish.queue.js            ✅ BullMQ queue
│   │           └── publish.worker.js           ✅ BullMQ worker
│   └── app.js                                  ✅ all routers + workers started
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
| GET | `/health` | None | Server + DB + Redis status |

#### Auth
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/auth/register` | None | Register |
| POST | `/auth/login` | None | Login → tokens |
| POST | `/auth/refresh` | None | Rotate tokens |
| POST | `/auth/logout` | ✅ Bearer | Blacklist token |
| GET | `/auth/me` | ✅ Bearer | Own auth data |

#### Profile
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/profile/me` | ✅ Bearer | Full profile |
| PATCH | `/profile/me` | ✅ Bearer | Update profile |
| PATCH | `/profile/me/avatar` | ✅ Bearer | Upload avatar |
| GET | `/profile/me/pricing-guidance` | ✅ Freelancer | Market pricing hints |
| GET | `/profile/:userId` | ✅ Bearer | Public profile |

#### KYC
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/kyc/status` | ✅ Bearer | KYC status |
| POST | `/kyc/basic` | ✅ Bearer | Submit basic KYC |
| POST | `/kyc/identity` | ✅ Bearer | Submit identity KYC |
| POST | `/kyc/address` | ✅ Bearer | Submit address KYC |
| GET | `/kyc/admin/pending` | ✅ Admin | Pending queue |
| PATCH | `/kyc/admin/review/:id` | ✅ Admin | Approve / reject |

#### Admin
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/admin/dashboard` | ✅ Admin | Platform stats |
| GET | `/admin/users` | ✅ Admin | List users |
| GET | `/admin/users/:id` | ✅ Admin | User detail |
| PATCH | `/admin/users/:id/approval` | ✅ Admin | Approve / suspend |
| PATCH | `/admin/users/:id/level` | ✅ Admin | Set freelancer level |
| GET | `/admin/categories` | ✅ Admin | All categories |
| POST | `/admin/categories` | ✅ Admin | Create category |
| PATCH | `/admin/categories/:id/toggle` | ✅ Admin | Toggle active |
| GET | `/admin/jobs` | ✅ Admin | All jobs |
| PATCH | `/admin/jobs/:id/status` | ✅ Admin | Update status |
| GET | `/admin/price-ranges` | ✅ Admin | Price ranges |
| PUT | `/admin/price-ranges/:categoryId` | ✅ Admin | Upsert price range |

#### Categories
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/categories` | None | Active categories |
| GET | `/categories/:id/market-range` | None | Market price range |

#### Jobs
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/jobs` | ✅ Client + Approved | Create → matching auto-triggers |
| POST | `/jobs/draft` | ✅ Client + Approved | Create draft |
| PATCH | `/jobs/:id/publish` | ✅ Client + Approved | Publish → matching triggers |
| PATCH | `/jobs/:id` | ✅ Client + Approved | Update draft |
| PATCH | `/jobs/:id/cancel` | ✅ Approved | Cancel job |
| GET | `/jobs/my/summary` | ✅ Client | Status counts |
| GET | `/jobs` | ✅ Approved | Role-filtered list |
| GET | `/jobs/:id` | ✅ Approved | Single job |
| GET | `/jobs/admin/all` | ✅ Admin | All jobs |
| PATCH | `/jobs/admin/:id/status` | ✅ Admin | Update status |

#### Proposals
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/proposals/jobs/:jobId` | ✅ Freelancer | Submit proposal |
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
| POST | `/negotiations/jobs/:jobId/initiate` | ✅ Freelancer | Lock + open negotiation |
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
| GET | `/notifications` | ✅ Bearer | Paginated list |
| GET | `/notifications/unread-count` | ✅ Bearer | Badge count |
| PATCH | `/notifications/read-all` | ✅ Bearer | Mark all read |
| PATCH | `/notifications/:id/read` | ✅ Bearer | Mark one read |
| POST | `/notifications/admin/broadcast` | ✅ Admin | Broadcast |

#### Wallet
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/wallet` | ✅ Bearer | Balance + transactions |
| GET | `/wallet/transactions` | ✅ Bearer | History |
| POST | `/wallet/withdraw` | ✅ Freelancer | Request withdrawal |
| GET | `/wallet/admin/stats` | ✅ Admin | Platform overview |
| GET | `/wallet/admin/withdrawals` | ✅ Admin | Pending withdrawals |
| PATCH | `/wallet/admin/withdrawals/:id` | ✅ Admin | Approve/reject |
| POST | `/wallet/admin/jobs/:jobId/complete` | ✅ Admin | Complete → release escrow |
| POST | `/wallet/admin/jobs/:jobId/cancel` | ✅ Admin | Cancel → refund escrow |
| POST | `/wallet/admin/users/:userId/adjust` | ✅ Admin | Manual adjustment |

#### Payments
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/payments/topup/order` | ✅ Bearer | Create Razorpay order |
| POST | `/payments/topup/verify` | ✅ Bearer | Verify payment |
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
| GET | `/social/connect/:platform` | `?token=` | Start OAuth flow |
| GET | `/social/callback/:platform` | None | OAuth callback |
| GET | `/social/accounts` | ✅ Bearer | Connected accounts |
| DELETE | `/social/accounts/:id` | ✅ Bearer | Disconnect account |
| GET | `/social/posts` | ✅ Bearer | List posts |
| POST | `/social/posts` | ✅ Approved | Create draft post |
| GET | `/social/posts/:id` | ✅ Bearer | Post detail |
| POST | `/social/posts/:id/media` | ✅ Approved | Add media |
| POST | `/social/posts/:id/publish` | ✅ Approved | Publish/schedule |
| POST | `/social/posts/:id/cancel` | ✅ Bearer | Cancel post |
| GET | `/social/posts/:id/analytics` | ✅ Bearer | Pull analytics |

---

## 📱 Social Media System (Phase 8)

### How It Works
Each client connects their own social accounts with one click. Mint More stores their OAuth tokens and publishes on their behalf.

```
Client clicks "Connect Facebook/Instagram"
        ↓
GET /api/v1/social/connect/facebook?token=JWT
        ↓
Backend redirects to Facebook OAuth
        ↓
Client logs in with their OWN Facebook account
        ↓
Facebook redirects back to callback
        ↓
Backend saves client's tokens in social_accounts table
(linked to their user_id — completely isolated from other clients)
        ↓
Client can now publish to their own accounts from Mint More
```

### Platform Requirements
| Platform | Client Needs |
|----------|-------------|
| Facebook | Facebook account + at least one Page they manage |
| Instagram | Instagram Business/Creator account connected to their FB Page |
| YouTube | Google account with a YouTube channel |

> ⚠️ Personal Instagram accounts do NOT work — must be Business or Creator. This is Meta's restriction.

### Content Types Supported
| Type | Facebook | Instagram | YouTube |
|------|----------|-----------|---------|
| Text post | ✅ | ❌ | ❌ |
| Single image | ✅ | ✅ | ❌ |
| Single video | ✅ | ✅ | ✅ |
| Carousel | ✅ | ✅ | ❌ |
| Reel | ❌ | ✅ | ❌ |
| Short | ❌ | ❌ | ✅ |

### Publishing Flow
```
Client creates draft post → adds media → clicks Publish
        ↓
POST /social/posts/:id/publish
        ↓
Backend creates per-platform status rows
        ↓
BullMQ job enqueued (immediate or delayed for scheduled)
        ↓
Worker picks up job → publishes to all platforms in parallel
(Promise.allSettled — one failure doesn't block others)
        ↓
Per-platform status updated (published / failed)
        ↓
Overall post status: published / failed
```

### Scheduling
```
POST /social/posts { publish_at: "2026-05-15T18:30:00Z" }
→ status = 'scheduled'
→ BullMQ delay = publish_at - now
→ Worker fires exactly at publish_at
→ Can cancel any time before firing
```

### Token Management
- Facebook tokens last 60 days — auto-refreshed 7 days before expiry
- YouTube tokens (Google OAuth) — refreshed via refresh_token automatically
- Tokens stored per-user in `social_accounts` table
- Completely isolated — each client's tokens are independent

### External Setup Status
| Service | Status |
|---------|--------|
| Meta Business Verification | ⏳ In Review (applied — 2 business days) |
| Facebook App permissions | ⏳ Pending (after business verification) |
| Google Cloud Project | ✅ Created |
| YouTube Data API v3 | ✅ Enabled |
| YouTube OAuth consent screen | ✅ Configured |
| YouTube OAuth client ID | ✅ Created — add to .env |
| YouTube test users | ✅ Add agency@mintmoremarketing.com |

### After Meta Business Verification
1. App → Add Product → Facebook Login
2. Add redirect URI: `http://localhost:5000/api/v1/social/callback/facebook`
3. App Review → Request permissions:
   - `pages_show_list`
   - `pages_manage_posts`
   - `instagram_content_publish`
   - `instagram_manage_insights`

---

## 🟢 WhatsApp System (Phase 7)

### Architecture
```
Client messages MM Main Number
        ↓
State machine (conversation.service.js):
  new_contact → welcome menu
  awaiting_service → validate 1-6
  awaiting_brief → collect project brief
  transferring → generate MMSTART-XXXX token → send wa.me link
        ↓
Client taps link → messages MM Category Number
        ↓
  awaiting_activation → validate token → activate
                      → create job + trigger matching
  active_job_chat → route to chat room ↔ freelancer web app
  job_completed → redirect to main
```

### State Machine Rules
| State | Valid Input | Response |
|-------|-------------|----------|
| `new_contact` | Anything | Welcome menu |
| `awaiting_service` | 1–6 | Brief prompt |
| `awaiting_service` | Anything else | Re-send menu |
| `awaiting_brief` | Text ≥5 chars | Transfer link + token |
| `transferring` | RESTART | Reset to menu |
| `transferring` | Anything else | "Use the link we sent" |
| `awaiting_activation` | `MMSTART-XXXX` | Activate chat room |
| `awaiting_activation` | Anything else | Redirect to main |
| `active_job_chat` | Any message | Route to freelancer |
| `job_completed` | Any message | "Start new project at main" |

### WhatsApp Numbers
| Number | category_id | Status |
|--------|-------------|--------|
| Meta test `+1 415 523 8886` | NULL (main) | ✅ Seeded — Phone ID: `1092380853958380` |
| MM Videography | video-editing UUID | ⏳ Need fresh SIM |
| MM Design | graphic-design UUID | ⏳ Need fresh SIM |
| MM Content | content-writing UUID | ⏳ Need fresh SIM |

### Meta App Status
| Item | Status |
|------|--------|
| App created + published | ✅ |
| System user token | ✅ |
| App secret configured | ✅ |
| Webhook verified + messages subscribed | ✅ |
| Signature verification working | ✅ |
| Test number seeded in DB | ✅ |
| Business verification | ⏳ In Review |
| Real SIM numbers | ⏳ Need 2 fresh SIMs |

---

## 💰 Wallet System (Phase 6)

### Transaction Types
| Type | Direction | Trigger |
|------|-----------|---------|
| `topup` | +balance | Razorpay payment.captured webhook |
| `escrow_hold` | -balance +escrow | Admin approves deal |
| `escrow_release` | -escrow +freelancer | Job completed |
| `escrow_refund` | -escrow +client | Job cancelled |
| `withdrawal` | -balance | Freelancer requests payout |
| `withdrawal_rejected` | +balance | Admin rejects withdrawal |
| `adjustment` | ±balance | Admin manual (testing/corrections) |

### Escrow Flow
```
Client balance ──(hold on deal approval)──→ Client escrow_balance
                                                    │
                                      Job complete  │  Job cancelled
                                                    ▼       ▼
                                         Freelancer     Client
                                          balance       balance
```

### Admin Manual Adjustment
```bash
POST /api/v1/wallet/admin/users/:userId/adjust
{ "amount": 10000, "note": "Test credit for development" }
```

---

## 🔔 Notification System (Phase 5)

### 15 Notification Types
| Type | Trigger | Recipient |
|------|---------|-----------|
| `job_matched` | Matching runs | Matched freelancers |
| `negotiation_initiated` | Freelancer opens | Client |
| `negotiation_countered` | Either counters | Other party |
| `negotiation_accepted` | Either accepts | Both |
| `negotiation_rejected` | Either rejects | Both |
| `deal_pending_admin` | Deal agreed | All admins |
| `deal_approved` | Admin approves | Freelancer + Client |
| `deal_rejected_by_admin` | Admin rejects | Freelancer + Client |
| `assignment_created` | Admin approves | Freelancer |
| `assignment_accepted` | Freelancer accepts | Client + Admins |
| `assignment_declined` | Freelancer declines | Client + Admins |
| `kyc_approved` | Admin approves KYC | User |
| `kyc_rejected` | Admin rejects KYC | User |
| `admin_broadcast` | Admin sends | All / by role |
| `system` | System events | Any user |

### SSE Protocol
```
Connect: GET /notifications/stream?token=ACCESS_TOKEN
Events:  data: {"type":"notification","payload":{...}}
         data: {"type":"chat_message","roomId":"...","message":{...}}
Ping:    : ping  (every 30s)
```

---

## 🧠 Matching Engine

### Pipeline
```
SQL: WHERE role = 'freelancer' (only filter)
              ↓ JS application layer
checkEligibility():
  is_available + is_approved + is_active
  active_jobs_count < 5
  expert mode → experienced level only
              ↓
evaluatePricingAlignment():
  budget mode: experienced excluded if price > intermediate_max × 1.15
  expert mode: non-experienced excluded
              ↓
computeScore():
  base = skill(0.40) + level(0.25) + rating(0.20) + fairness(0.15)
  × workload_multiplier
  + new_freelancer_boost (+0.10)
  + idle_bonus (+0.00–0.15)
  + kyc_bonus (+0.05)
  + profile_bonus (+0.05)
  + pricing_contribution (max 0.15)
  clamped [0, 1]
              ↓
rank → tier → top 10 → saveMatchedCandidates()
              ↓
notifyMatchedCandidates() via setImmediate
```

### Scoring Constants
| Constant | Value | Purpose |
|----------|-------|---------|
| `MAX_ACTIVE_JOBS` | 5 | Hard disqualifier |
| `MAX_JOBS_REFERENCE` | 10 | Fairness denominator |
| `NEW_FREELANCER_BOOST` | +0.10 | 0 jobs done |
| `TOP_N_CANDIDATES` | 10 | Max per job |
| `MAX_ROUNDS` | 2 | Negotiation cap |

### active_jobs_count Lifecycle
| Event | Change |
|-------|--------|
| Admin approves deal | +1 |
| Freelancer declines assignment | -1 |
| Job completed | -1 |
| Job cancelled while assigned | -1 |

---

## 👁️ Job Visibility Rules

| Role | GET /jobs | GET /jobs/:id |
|------|-----------|---------------|
| admin | All jobs | Any job |
| client | Own jobs only | Own job → 404 otherwise |
| freelancer | Only matched jobs | Only if matched → 404 |

> 404 not 403 — prevents information leakage about job existence.

---

## 🗄️ Database Schema (All Tables)

### users
```sql
id, email, phone, password_hash, role,
full_name, avatar_url, bio, skills, gender, date_of_birth,
address_city, address_state, country,
is_active, is_approved, approved_at, approved_by,
is_email_verified, kyc_status, kyc_level,
freelancer_level, level_set_by_admin, is_available,
jobs_completed_count, active_jobs_count, average_rating,
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
status, matched_at, match_method,
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

### transactions (immutable ledger — INSERT only)
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
id, user_id,
title, caption, hashtags[], mentions[],
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
thumbnail_url, alt_text, sort_order,
created_at
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

### notifications
```sql
id, user_id, type (15 types),
title, body, entity_type, entity_id,
data (JSONB), is_read, read_at, created_at
```

### negotiations
```sql
id, job_id, freelancer_id, client_id,
status, current_round, max_rounds (2),
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
status, freelancer_note,
responded_at, started_at, completed_at, completed_at_confirmed,
completion_note, admin_note,
created_at, updated_at
```

---

## 🔧 Bug Fixes Log

### Phase 4E — FOR UPDATE + LEFT JOIN
```js
// CORRECT — no joins with FOR UPDATE
await client.query(`SELECT * FROM jobs WHERE id = $1 FOR UPDATE`, [jobId]);
```

### Phase 4E — admin.routes.js
```js
// CORRECT function name
router.get('/jobs', jobController.adminListAllJobs);
```

### Phase 7 — rawBody Buffer
```js
// CORRECT — Buffer not string concat
let data = Buffer.alloc(0);
req.on('data', (chunk) => { data = Buffer.concat([data, chunk]); });
req.on('end', () => { req.rawBody = data.toString('utf8'); next(); });
```

---

## 🔐 Auth System

- Access Token: JWT 15min — `JWT_ACCESS_SECRET`
- Refresh Token: JWT 7d — stored in DB, rotated on every use
- Logout: Redis blacklist (20min) + DB refresh cleared
- RBAC: `authenticate` + `authorize('admin'|'freelancer'|'client')`
- Platform Gate: `requireApproved`
- Token Payload: `{ sub, email, role, iat, exp }`

---

## 🏗️ Key Architecture Decisions

| Decision | Reason |
|----------|--------|
| Session Pooler (IPv4) | Network only supports IPv4 |
| SQL fetches only `role = 'freelancer'` | All filtering in JS — transparent, debuggable |
| Immutable transaction ledger | Every financial event INSERT only — full audit trail |
| Wallet balance + escrow separate | Client's locked money is not spendable |
| `FOR UPDATE` on wallet rows | Prevents concurrent double-spend |
| Webhook routes before `express.json()` | Razorpay + WA need raw body for signature |
| BullMQ for social publishing | Publishing takes 2–60s — must be async |
| `Promise.allSettled` for multi-platform | One failure doesn't block others |
| Per-platform status rows | Granular error visibility per platform |
| Facebook tokens long-lived (60 days) | Short tokens would break scheduled posts |
| WA state machine per session | Each client conversation tracked independently |
| Handoff token single-use + 30min TTL | Security — cannot reuse or share |
| Category number rejects non-token messages | Prevents cold-contact abuse |
| Freelancer identity hidden from client | Client always sees "Mint More" |
| 404 not 403 for unmatched jobs | Prevents information leakage |
| `setImmediate` for all triggers | Non-blocking — failures never affect main logic |
| `GREATEST(0, count - 1)` on decrements | Guards against negative values |

---

## 📦 Phase 9 — AI Tools (Next)

OpenRouter (text: GPT-4o, Claude, Llama), Replicate (images: Flux/SDXL, video), BullMQ async queue, SSE progress streaming, credit deduction from wallet, generation history.

**Planned routes:**
```
POST /ai/text/generate
POST /ai/image/generate
POST /ai/script/generate
POST /ai/caption/suggest
POST /ai/repurpose
GET  /ai/generations
GET  /ai/generations/:id
GET  /ai/usage
```

---

## 📋 Resume Context (paste into new Claude chat)

```
You are a senior full-stack engineer continuing "Mint More" — a controlled matchmaking SaaS.

TECH: Node.js + Express + PostgreSQL (Supabase Session Pooler) + Redis + BullMQ +
      Supabase Storage + SSE + Razorpay + Meta WhatsApp Cloud API +
      Facebook Graph API + Instagram Graph API + YouTube Data API v3

DB: host=aws-1-ap-south-1.pooler.supabase.com port=5432 user=postgres.grnnqilqrzlnrtbfrpyx SSL=true

COMPLETED:
- Phase 1:          Foundation
- Phase 2:          Auth (JWT + Redis blacklist + RBAC)
- Phase 3:          Profile + KYC (3-level, Supabase Storage, atomic approval)
- Phase 4A:         Admin (approval, freelancer levels, categories, dashboard)
- Phase 4B:         Jobs (lifecycle, role visibility, metadata, pricing_mode)
- Phase 4C:         Matching (scoring engine, tier notifications, pricing)
- Phase 4C-fix:     Matching — SQL role=freelancer only, ALL filters in JS
- Phase 4C-pricing: category_price_ranges, market guidance, pricing score
- Phase 4D:         Negotiation (lock, 2-round, fallback, admin approval, assignment)
- Phase 4E:         Auto matching + visibility control (404 unmatched freelancers)
- Phase 5:          In-app notifications (SSE + Redis pub/sub + 15 trigger types)
- Phase 6:          Wallet + Escrow (Razorpay, escrow hold/release/refund, withdrawals, admin adjust)
- Phase 7:          WhatsApp-bridged chat (state machine, handoff tokens, anonymous freelancer)
- Phase 8:          Social media publishing (FB/IG/YT OAuth, multi-platform, BullMQ scheduling, analytics)

KEY RULES:
- NOT a bidding marketplace — controlled matchmaking
- Matching: SQL = role=freelancer only — all eligibility in JS
- rank 1 → position=primary → jobs.active_freelancer_id
- rank 2 → position=backup → jobs.backup_freelancer_id
- FOR UPDATE never with LEFT JOIN
- active_jobs_count = workload (+1 approve, -1 decline/complete/cancel)
- jobs_completed_count = historical (fairness scoring)
- Max negotiation rounds = 2
- Escrow held on admin approval, released on complete, refunded on cancel
- Transactions immutable ledger (INSERT only)
- Both Razorpay + WA webhooks need rawBody BEFORE express.json()
- BullMQ worker started in app.js via startPublishWorker()
- Social: each client connects their OWN accounts via OAuth — tokens stored per user_id
- Social: Promise.allSettled for multi-platform publish — partial success allowed
- Facebook tokens refreshed 7 days before 60-day expiry
- WA: clients use main number → state machine → handoff token → category number
- WA: MMSTART-XXXX only valid input on category number (awaiting_activation state)
- WA: freelancer always anonymous to client (shows as "Mint More")
- Notifications: in-app SSE only — no WhatsApp for freelancers
- requireApproved on all marketplace routes
- Response: { success, message, data } via apiResponse.js
- AppError for operational errors
- admin.routes.js calls jobController.adminListAllJobs

EXTERNAL STATUS:
- Meta Business Verification: IN REVIEW (2 business days)
- Facebook/Instagram permissions: pending after verification
- YouTube OAuth: setup complete — add Client ID + Secret to .env
- WA test number: +1 415 523 8886 (ID: 1092380853958380) seeded as MM Main
- WA real numbers: need 2 fresh SIMs

NEXT: Phase 9 — AI Tools Integration
(OpenRouter text, Replicate image/video, BullMQ AI queue, SSE progress, credit deduction)

Rules: one phase at a time, complete working code only, no shortcuts.
```