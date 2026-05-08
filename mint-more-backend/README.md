# 🌿 Mint More — SaaS Platform
### Master Project README — Progress Tracker & Context Document
> **Purpose:** Tracks every phase, decision, config, and file in the Mint More backend.
> Paste the resume block at the bottom into a new Claude chat to continue exactly where you left off.

---

## 🧠 Project Summary

**Mint More** is a production-level controlled matchmaking + negotiation SaaS platform.
**NOT** an open bidding marketplace — uses structured negotiation with admin oversight.
Freelancers only see jobs they were matched to by the engine.

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
| 6 | Wallet + Escrow Payment System | 🔲 Not Started |
| 7 | Real-time Chat System | 🔲 Not Started |
| 8 | Social Media Integration + Publishing System | 🔲 Not Started |
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

### Integrations (Planned)
- **Payments:** Razorpay
- **Social Media:** Facebook Graph API, YouTube Data API v3, Instagram Graph API
- **AI Models:** OpenRouter / Replicate

### Key Libraries
| Package | Purpose |
|---------|---------|
| `pg` | PostgreSQL pool |
| `ioredis` | Redis client + SSE pub/sub subscriber |
| `jsonwebtoken` | JWT access + refresh tokens |
| `bcrypt` | Password hashing |
| `multer` | File upload (memory storage) |
| `@supabase/supabase-js` | Supabase Storage client |
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
# CRITICAL: Always use Session Pooler host — NOT db.xxxxx.supabase.co (IPv6)
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

# ── PAYMENTS (Phase 6) ────────────────────────────────
# RAZORPAY_KEY_ID=
# RAZORPAY_KEY_SECRET=
# RAZORPAY_WEBHOOK_SECRET=

# ── SOCIAL MEDIA (Phase 8) ────────────────────────────
# FACEBOOK_APP_ID=
# FACEBOOK_APP_SECRET=
# INSTAGRAM_APP_ID=
# INSTAGRAM_APP_SECRET=
# YOUTUBE_CLIENT_ID=
# YOUTUBE_CLIENT_SECRET=
# YOUTUBE_REDIRECT_URI=

# ── AI (Phase 9) ─────────────────────────────────────
# OPENROUTER_API_KEY=
# REPLICATE_API_TOKEN=
```

> 🔑 Generate JWT secrets:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

---

## 🗄️ Database

### Connection Policy (CRITICAL)
> ⚠️ This project runs on an **IPv4-only network**.
> Always use the **Session Pooler** host — NEVER `db.xxxxx.supabase.co` (IPv6).

```
Host:     aws-1-ap-south-1.pooler.supabase.com
Port:     5432
User:     postgres.grnnqilqrzlnrtbfrpyx
SSL:      { rejectUnauthorized: false }
```

### Supabase Project Info
- **Org:** mintmoremarketing's Org
- **Project:** Mint-more-saas
- **Branch:** main (PRODUCTION)
- **Email:** agency@mintmoremarketing.com

### Migrations Run
| File | Description | Status |
|------|-------------|--------|
| `001_create_users.sql` | Users table, enums, indexes, trigger | ✅ Done |
| `002_create_kyc.sql` | KYC submissions table, alter users | ✅ Done |
| `003_marketplace_foundation.sql` | Jobs, proposals, assignments, categories, enums, user fields | ✅ Done |
| `004_jobs_metadata.sql` | Add `metadata JSONB` to jobs | ✅ Done |
| `005_pricing_system.sql` | `category_price_ranges` table, `pricing_mode` enum, freelancer price fields, seeded ranges | ✅ Done |
| `006_active_jobs_count.sql` | Add `active_jobs_count` to users, backfill, non-negative constraint | ✅ Done |
| `007_negotiation_system.sql` | `negotiations`, `negotiation_rounds`, `job_matched_candidates`, job locking fields, new job_status enum values | ✅ Done |
| `008_notifications.sql` | `notifications` table, `notification_type` enum (15 types), indexes | ✅ Done |

### Supabase Storage Buckets
| Bucket | Public | Purpose |
|--------|--------|---------|
| `avatars` | ✅ Yes | User profile pictures |
| `kyc-docs` | ❌ No | KYC identity documents (private) |
| `job-attachments` | ✅ Yes | Job brief files, reference docs |

---

## 📁 Full Folder Structure

```
mint-more-backend/
├── src/
│   ├── config/
│   │   ├── env.js                              ✅ Central env config
│   │   ├── database.js                         ✅ PostgreSQL pool (Session Pooler)
│   │   ├── redis.js                            ✅ Redis client (ioredis)
│   │   └── supabase.js                         ✅ Supabase Storage client
│   ├── db/
│   │   └── migrations/
│   │       ├── 001_create_users.sql            ✅
│   │       ├── 002_create_kyc.sql              ✅
│   │       ├── 003_marketplace_foundation.sql  ✅
│   │       ├── 004_jobs_metadata.sql           ✅
│   │       ├── 005_pricing_system.sql          ✅
│   │       ├── 006_active_jobs_count.sql       ✅
│   │       ├── 007_negotiation_system.sql      ✅
│   │       └── 008_notifications.sql           ✅
│   ├── middleware/
│   │   ├── authenticate.js                     ✅ JWT auth + authorize() factory
│   │   ├── errorHandler.js                     ✅ 404 + global error handler
│   │   ├── rateLimiter.js                      ✅ Global rate limiter
│   │   ├── requestLogger.js                    ✅ Morgan → Winston
│   │   ├── requireApproved.js                  ✅ Platform approval gate
│   │   ├── upload.js                           ✅ Multer (memoryStorage)
│   │   └── sse.js                              ✅ SSE connection handler + Redis subscriber
│   ├── modules/
│   │   ├── health/
│   │   │   ├── health.routes.js                ✅
│   │   │   ├── health.controller.js            ✅
│   │   │   └── health.service.js               ✅
│   │   ├── auth/
│   │   │   ├── auth.routes.js                  ✅
│   │   │   ├── auth.controller.js              ✅
│   │   │   ├── auth.service.js                 ✅
│   │   │   └── auth.validator.js               ✅
│   │   ├── profile/
│   │   │   ├── profile.routes.js               ✅
│   │   │   ├── profile.controller.js           ✅
│   │   │   ├── profile.service.js              ✅
│   │   │   └── profile.validator.js            ✅
│   │   ├── kyc/
│   │   │   ├── kyc.routes.js                   ✅
│   │   │   ├── kyc.controller.js               ✅
│   │   │   ├── kyc.service.js                  ✅ notifyKycReviewed trigger wired
│   │   │   └── kyc.validator.js                ✅
│   │   ├── admin/
│   │   │   ├── admin.routes.js                 ✅ calls jobController.adminListAllJobs
│   │   │   ├── admin.controller.js             ✅
│   │   │   ├── admin.service.js                ✅
│   │   │   └── admin.validator.js              ✅
│   │   ├── categories/
│   │   │   ├── category.routes.js              ✅
│   │   │   └── category.controller.js          ✅
│   │   ├── jobs/
│   │   │   ├── job.routes.js                   ✅
│   │   │   ├── job.controller.js               ✅
│   │   │   ├── job.service.js                  ✅ auto-match + visibility control
│   │   │   └── job.validator.js                ✅
│   │   ├── proposals/
│   │   │   ├── proposal.routes.js              ✅
│   │   │   ├── proposal.controller.js          ✅
│   │   │   ├── proposal.service.js             ✅
│   │   │   └── proposal.validator.js           ✅
│   │   ├── matching/
│   │   │   ├── matching.routes.js              ✅
│   │   │   ├── matching.controller.js          ✅
│   │   │   ├── matching.service.js             ✅ notifyMatchedCandidates trigger wired
│   │   │   └── pricing.service.js              ✅
│   │   ├── negotiation/
│   │   │   ├── negotiation.routes.js           ✅
│   │   │   ├── negotiation.controller.js       ✅
│   │   │   └── negotiation.service.js          ✅ all negotiation triggers wired
│   │   └── notifications/
│   │       ├── notification.routes.js          ✅
│   │       ├── notification.controller.js      ✅
│   │       ├── notification.service.js         ✅ create, bulk, read, mark, broadcast
│   │       └── notification.triggers.js        ✅ all trigger functions
│   └── app.js                                  ✅ all routers registered + initSSESubscriber
├── .env                                        ✅ (never commit)
├── .env.example                                ✅
├── .gitignore                                  ✅
├── package.json                                ✅
└── server.js                                   ✅
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
| POST | `/auth/register` | None | Register (role: client/freelancer) |
| POST | `/auth/login` | None | Login → tokens |
| POST | `/auth/refresh` | None | Rotate tokens |
| POST | `/auth/logout` | ✅ Bearer | Blacklist token |
| GET | `/auth/me` | ✅ Bearer | Own auth data |

#### Profile
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/profile/me` | ✅ Bearer | Full profile |
| PATCH | `/profile/me` | ✅ Bearer | Update profile + price fields |
| PATCH | `/profile/me/avatar` | ✅ Bearer | Upload avatar |
| GET | `/profile/me/pricing-guidance` | ✅ Freelancer | Market pricing hints |
| GET | `/profile/:userId` | ✅ Bearer | Public profile |

#### KYC
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/kyc/status` | ✅ Bearer | KYC status + submissions |
| POST | `/kyc/basic` | ✅ Bearer | Submit basic KYC |
| POST | `/kyc/identity` | ✅ Bearer | Submit identity KYC (multipart) |
| POST | `/kyc/address` | ✅ Bearer | Submit address KYC (multipart) |
| GET | `/kyc/admin/pending` | ✅ Admin | List pending submissions |
| PATCH | `/kyc/admin/review/:id` | ✅ Admin | Approve / reject |

#### Admin
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/admin/dashboard` | ✅ Admin | Platform stats |
| GET | `/admin/users` | ✅ Admin | List users (filter/search/paginate) |
| GET | `/admin/users/:userId` | ✅ Admin | User detail |
| PATCH | `/admin/users/:userId/approval` | ✅ Admin | Approve / suspend user |
| PATCH | `/admin/users/:userId/level` | ✅ Admin | Set freelancer level |
| GET | `/admin/categories` | ✅ Admin | All categories (incl. inactive) |
| POST | `/admin/categories` | ✅ Admin | Create category |
| PATCH | `/admin/categories/:categoryId/toggle` | ✅ Admin | Toggle active state |
| GET | `/admin/jobs` | ✅ Admin | All jobs (calls `adminListAllJobs`) |
| PATCH | `/admin/jobs/:jobId/status` | ✅ Admin | Update job status |
| GET | `/admin/price-ranges` | ✅ Admin | All category price ranges |
| PUT | `/admin/price-ranges/:categoryId` | ✅ Admin | Upsert price range |

#### Categories (Public)
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/categories` | None | Active categories |
| GET | `/categories/:id/market-range` | None | Market price range for category |

#### Jobs
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/jobs` | ✅ Client + Approved | Create job as `open` — matching auto-triggers |
| POST | `/jobs/draft` | ✅ Client + Approved | Create job as `draft` |
| PATCH | `/jobs/:id/publish` | ✅ Client + Approved | Publish draft → matching auto-triggers |
| PATCH | `/jobs/:id` | ✅ Client + Approved | Update draft |
| PATCH | `/jobs/:id/cancel` | ✅ Approved | Cancel job |
| GET | `/jobs/my/summary` | ✅ Client | Job status counts |
| GET | `/jobs` | ✅ Approved | Role-filtered list |
| GET | `/jobs/:id` | ✅ Approved | Role-gated single job |
| GET | `/jobs/admin/all` | ✅ Admin | All jobs unfiltered |
| PATCH | `/jobs/admin/:id/status` | ✅ Admin | Update status |

#### Proposals
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/proposals/jobs/:jobId` | ✅ Freelancer + Approved | Submit proposal |
| DELETE | `/proposals/:id` | ✅ Freelancer | Withdraw proposal |
| GET | `/proposals/my` | ✅ Freelancer | Own proposals |
| GET | `/proposals/jobs/:jobId/client` | ✅ Client | Shortlisted proposals |
| GET | `/proposals/jobs/:jobId/admin` | ✅ Admin | All proposals for job |
| PATCH | `/proposals/:id/review` | ✅ Admin | Shortlist / reject |

#### Matching
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/matching/jobs/:jobId/run` | ✅ Admin | Manual re-run |
| GET | `/matching/jobs/:jobId/preview` | ✅ Admin | Preview without persisting |
| GET | `/matching/jobs/:jobId/pool` | ✅ Admin | Full scored freelancer pool |

#### Negotiations
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/negotiations/jobs/:jobId/initiate` | ✅ Freelancer | Open negotiation — locks job |
| PATCH | `/negotiations/jobs/:jobId/freelancer-respond` | ✅ Freelancer | Counter / accept / reject |
| PATCH | `/negotiations/jobs/:jobId/client-respond` | ✅ Client | Counter / accept / reject |
| PATCH | `/negotiations/jobs/:jobId/assignment-respond` | ✅ Freelancer | Accept / decline assignment |
| GET | `/negotiations/jobs/:jobId/status` | ✅ Any | View negotiation state |
| GET | `/negotiations/admin/pending-approvals` | ✅ Admin | Jobs awaiting deal approval |
| POST | `/negotiations/admin/jobs/:jobId/approve-deal` | ✅ Admin | Approve deal → assignment |
| POST | `/negotiations/admin/jobs/:jobId/reject-deal` | ✅ Admin | Reject deal → fallback |

#### Notifications
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/notifications/stream` | ✅ `?token=` | SSE real-time stream |
| GET | `/notifications` | ✅ Bearer | Paginated list (`?unread_only=true` supported) |
| GET | `/notifications/unread-count` | ✅ Bearer | Badge count |
| PATCH | `/notifications/read-all` | ✅ Bearer | Mark all as read |
| PATCH | `/notifications/:id/read` | ✅ Bearer | Mark one as read |
| POST | `/notifications/admin/broadcast` | ✅ Admin | Broadcast to all or by role |

---

## 🚀 Full Product Flow

```
1. Client posts job
   POST /jobs → status: 'open'
   → matching engine runs automatically (setImmediate — non-blocking)
   → job_matched_candidates populated
       rank 1  → position = 'primary'   → jobs.active_freelancer_id
       rank 2  → position = 'backup'    → jobs.backup_freelancer_id
       rank 3+ → position = 'candidate'
   → job status → 'matching'
   → all matched freelancers receive in-app notification (job_matched) via SSE

   Alt: POST /jobs/draft → PATCH /jobs/:id/publish
   → same auto-match trigger fires on publish

2. Freelancer visibility (controlled marketplace)
   GET /jobs        → ONLY jobs in job_matched_candidates for that freelancer
   GET /jobs/:id    → 404 if freelancer not matched (no info leak)

3. Tiered notification delivery (in-app SSE only — NOT WhatsApp / email)
   notify_at stored per candidate in job_matched_candidates
   Tier 1 (0 jobs completed):   notify immediately
   Tier 2 (1–5 jobs completed): notify +5 min
   Tier 3 (>5 jobs completed):  notify +10 min

4. Primary freelancer initiates negotiation
   POST /negotiations/jobs/:jobId/initiate
   → job status → 'locked'
   → active_freelancer_id confirmed
   → backup + other candidates blocked (403)
   → client receives negotiation_initiated notification

5. Negotiation loop (max 2 rounds)
   → freelancer proposes / client counters
   → each action fires negotiation_countered notification to the other party
   → on agree: job → 'pending_admin_approval'
   → all admins receive deal_pending_admin notification

6. Fallback (on any reject / fail)
   → backup exists:  promote backup → primary, lock, re-negotiate
                     both parties receive negotiation_rejected notification
   → no backup:      job → 'matching' (auto re-run triggered)

7. Admin approves deal
   POST /negotiations/admin/jobs/:jobId/approve-deal
   → negotiation status → 'admin_approved'
   → job_assignment created (status: 'pending_acceptance')
   → job → 'assigned'
   → active_jobs_count++ for freelancer
   → freelancer receives deal_approved + assignment_created notifications
   → client receives deal_approved notification

8. Freelancer accepts assignment
   PATCH /negotiations/jobs/:jobId/assignment-respond { action: "accept" }
   → assignment status → 'accepted'
   → job → 'in_progress'
   → client + all admins receive assignment_accepted notification

9. Freelancer declines assignment
   → active_jobs_count-- (reverted)
   → fallback triggered again
   → client + all admins receive assignment_declined notification
```

---

## 🔔 Notification System (Phase 5)

### Architecture
```
Service / trigger function
        ↓
notification.triggers.js → createNotification() / createBulkNotifications()
        ↓  (DB INSERT into notifications table)
notifications table (PostgreSQL)
        ↓  (Redis PUBLISH to 'mint_more:notifications')
Redis pub/sub channel
        ↓  (SSE subscriber in sse.js receives message)
activeConnections Map<userId, Set<Response>>
        ↓  (writes SSE event to all open tabs for that user)
Browser / App  ←  data: { notification JSON }
```

### Notification Types
| Type | Trigger | Recipient(s) |
|------|---------|--------------|
| `job_matched` | Matching engine | Matched freelancers |
| `negotiation_initiated` | Freelancer initiates | Client |
| `negotiation_countered` | Either party counters | Other party |
| `negotiation_accepted` | Either party accepts | Both parties |
| `negotiation_rejected` | Either party rejects | Both parties |
| `deal_pending_admin` | Deal agreed | All admins |
| `deal_approved` | Admin approves | Freelancer + Client |
| `deal_rejected_by_admin` | Admin rejects | Freelancer + Client |
| `assignment_created` | Admin approves deal | Freelancer |
| `assignment_accepted` | Freelancer accepts | Client + All admins |
| `assignment_declined` | Freelancer declines | Client + All admins |
| `kyc_approved` | Admin approves KYC | User |
| `kyc_rejected` | Admin rejects KYC | User |
| `admin_broadcast` | Admin sends broadcast | All users or role group |
| `system` | System events | Any user |

### SSE Protocol
```
Client connects:
GET /api/v1/notifications/stream?token=ACCESS_TOKEN

Server sets headers:
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
X-Accel-Buffering: no

Events pushed:
data: {"id":"uuid","type":"job_matched","title":"...","body":"...","data":{...}}

Keepalive every 30s:
: ping
```

### Key Rules
- All trigger calls use `setImmediate` — post-commit, non-blocking
- Notification failures **never** affect business logic
- Browser `EventSource` cannot set headers — token passed as `?token=` query param
- One user can have multiple SSE connections (multiple tabs) — all receive simultaneously
- `activeConnections` Map lives in memory — browsers auto-reconnect on server restart (standard SSE behaviour)
- `unread_only=true` query param available on `GET /notifications`
- `role` param on broadcast: `'client'`, `'freelancer'`, `'admin'`, or omit for all

---

## 🧠 Matching Engine

### Pipeline
```
SQL: SELECT * FROM users WHERE role = 'freelancer'
   (no other SQL filters — all logic in JS)
              ↓
checkEligibility() — JS application layer:
  is_available = true
  is_approved  = true
  is_active    = true
  active_jobs_count < MAX_ACTIVE_JOBS (5)
  expert mode job → experienced level only
              ↓
evaluatePricingAlignment() — JS application layer:
  budget mode: experienced excluded if price > intermediate_max × 1.15
  expert mode: non-experienced excluded
              ↓
computeScore():
  base = skill(0.40) + level(0.25) + rating(0.20) + fairness(0.15)
  × workload_multiplier
  + new_freelancer_boost (+0.10 if 0 jobs completed)
  + idle_bonus           (+0.00 to +0.15)
  + kyc_bonus            (+0.05 if verified)
  + profile_bonus        (+0.05 max)
  + pricing_contribution (0.15 max)
  + competitive_boost    (+0.05 if applicable)
  clamped to [0, 1]
              ↓
assignTier() → sort by score DESC → top 10
              ↓
saveMatchedCandidates():
  rank 1  → position = 'primary'   → jobs.active_freelancer_id
  rank 2  → position = 'backup'    → jobs.backup_freelancer_id
  rank 3+ → position = 'candidate'
              ↓
notifyMatchedCandidates() — fire-and-forget via setImmediate
              ↓
job status → 'matching'
```

### Auto-Trigger
| Trigger | Method | How |
|---------|--------|-----|
| Job created as `open` | `createJob` | `setImmediate(() => runMatchingForJob(id))` |
| Draft published | `publishJob` | `setImmediate(() => runMatchingForJob(id))` |
| Admin manual override | `POST /matching/jobs/:id/run` | Direct synchronous call |

### Scoring Constants
| Constant | Value | Purpose |
|----------|-------|---------|
| `MAX_ACTIVE_JOBS` | 5 | Hard eligibility disqualifier |
| `MAX_JOBS_REFERENCE` | 10 | Fairness score denominator |
| `NEW_FREELANCER_BOOST` | +0.10 | Boost for 0 completed jobs |
| `TOP_N_CANDIDATES` | 10 | Max candidates persisted per job |
| `MAX_ROUNDS` | 2 | Hard negotiation round cap |
| `COMPETITIVE_TOLERANCE` | 15% | Grace zone above intermediate_max |
| `PRICING_SCORE_MAX_CONTRIBUTION` | 0.15 | Max pricing score weight |

### active_jobs_count Lifecycle
| Event | Change |
|-------|--------|
| Admin approves deal | +1 |
| Freelancer declines assignment | -1 |
| Job completed | -1 (Phase 6) |
| Job cancelled while assigned | -1 (Phase 6) |

---

## 👁️ Job Visibility Rules

| Role | `GET /jobs` | `GET /jobs/:id` |
|------|-------------|-----------------|
| admin | All jobs, all statuses | Any job |
| client | Own jobs only | Own job only → 404 otherwise |
| freelancer | Only jobs in `job_matched_candidates` | Only if matched → **404** otherwise |

> ⚠️ Freelancer access returns **404** (not 403) — a 403 would reveal the job exists.

---

## 🗄️ Database Schema (Current)

### `users`
```sql
id, email, phone, password_hash, role,
full_name, avatar_url, bio, skills, gender, date_of_birth,
address_city, address_state, country,
is_active, is_approved, approved_at, approved_by,
is_email_verified,
kyc_status, kyc_level,
freelancer_level, level_set_by_admin,
is_available,
jobs_completed_count,   -- historical total (fairness scoring)
active_jobs_count,      -- current workload (eligibility filter)
average_rating,
price_min, price_max, pricing_visibility,
refresh_token, last_login_at,
created_at, updated_at
```

### `jobs`
```sql
id, client_id, category_id,
title, description, requirements, attachments,
budget_type, budget_amount, currency,
pricing_mode,           -- 'budget' | 'expert'
required_level, required_skills,
deadline, metadata,
status,                 -- draft|open|matching|locked|pending_admin_approval
                        -- |assigned|in_progress|completed|cancelled
matched_at, match_method,
active_freelancer_id,   -- rank 1 from matching
backup_freelancer_id,   -- rank 2 from matching
locked_at,
negotiation_rounds,
deal_approved_by, deal_approved_at,
admin_note, assigned_by, assigned_at,
created_at, updated_at
```

### `job_matched_candidates`
```sql
id, job_id, freelancer_id,
rank,        -- 1 = primary, 2 = backup, 3+ = candidate
score,
tier,        -- 'tier_1_new' | 'tier_2_low' | 'tier_3_experienced'
notify_at,   -- when to deliver notification
notified_at,
position,    -- 'primary' | 'backup' | 'candidate'
created_at
UNIQUE(job_id, freelancer_id)
```

### `negotiations`
```sql
id, job_id, freelancer_id, client_id,
status,         -- pending|active|agreed|failed|admin_approved|cancelled
current_round,
max_rounds,     -- always 2
agreed_price, agreed_days,
admin_note, approved_by, approved_at,
created_at, updated_at
UNIQUE(job_id, freelancer_id)
```

### `negotiation_rounds`
```sql
id, negotiation_id, job_id,
round_number,
sender,         -- 'freelancer' | 'client'
proposed_price, proposed_days, message,
created_at
```

### `job_assignments`
```sql
id, job_id, freelancer_id, assigned_by, proposal_id,
status,         -- pending_acceptance|accepted|declined|completed|cancelled
freelancer_note, responded_at, started_at, completed_at,
admin_note,
created_at, updated_at
```

### `notifications`
```sql
id, user_id,
type,           -- notification_type enum (15 types)
title,          -- short title for notification bell
body,           -- full message text
entity_type,    -- 'job' | 'negotiation' | 'kyc' | 'assignment' | null
entity_id,      -- UUID of related entity | null
data,           -- JSONB free-form payload (deep links, amounts, etc.)
is_read,
read_at,
created_at
```

### `category_price_ranges`
```sql
id, category_id (UNIQUE),
beginner_min, beginner_max,
intermediate_min, intermediate_max,
experienced_min, experienced_max,
currency, notes,
created_by, updated_by,
created_at, updated_at
```

### `kyc_submissions`
```sql
id, user_id, level, status,
date_of_birth, gender, nationality,
document_type, document_number,
document_front_url, document_back_url, selfie_url,
address_line1, address_line2, city, state, pincode, country,
address_proof_url,
admin_note, reviewed_by, reviewed_at,
created_at, updated_at
```

---

## 🔧 Bug Fixes Log

### Phase 4E — PostgreSQL FOR UPDATE + LEFT JOIN
**Problem:** `ERROR: FOR UPDATE cannot be applied to the nullable side of an outer join`
**Fix:** Never use `FOR UPDATE` with `LEFT JOIN`. Lock the target row only.
```js
// CORRECT
const result = await client.query(
  `SELECT * FROM jobs WHERE id = $1 FOR UPDATE`, [jobId]
);
```

### Phase 4E — admin.routes.js Function Name Mismatch
**Problem:** `Route.get() requires a callback function but got [object Undefined]`
**Fix:** Function is exported as `adminListAllJobs` not `adminListJobs`.
```js
// CORRECT
router.get('/jobs', jobController.adminListAllJobs);
```

---

## 🔐 Auth System Design

- **Access Token:** JWT, 15 min expiry, signed with `JWT_ACCESS_SECRET`
- **Refresh Token:** JWT, 7 day expiry, stored in DB, rotated on every use
- **Logout:** Access token blacklisted in Redis (TTL: 20 min), refresh cleared from DB
- **RBAC:** `authenticate` middleware + `authorize('admin'|'freelancer'|'client')` factory
- **Platform Gate:** `requireApproved` middleware — blocks unapproved users from marketplace
- **Token Payload:** `{ sub, email, role, iat, exp }`

---

## 🏗️ Key Architecture Decisions

| Decision | Reason |
|----------|--------|
| Session Pooler (IPv4) | Network only supports IPv4 — direct Supabase host uses IPv6 |
| `pg.Pool` (no ORM) | Full SQL control, complex queries, transparent debugging |
| SQL fetches only `role = 'freelancer'` in matching | All filtering in JS — transparent, debuggable, never returns empty |
| `active_jobs_count` separate from `jobs_completed_count` | Workload = current eligibility; fairness = historical |
| `pricing_mode` on job | Cleaner client intent than relying solely on `required_level` |
| Pricing exclusion in JS, not SQL | Admin sees exactly why each candidate was excluded |
| `ineligible[]` always returned from matching | Debugging + admin transparency |
| `setImmediate` for auto-matching + notifications | Non-blocking — HTTP response returns instantly |
| Lazy `require` for matching in job.service | Breaks circular dependency: `job → matching → negotiation` |
| Freelancer job access returns 404 not 403 | 403 leaks job existence — 404 is safer |
| `FOR UPDATE` on `jobs` row only (no JOIN) | PostgreSQL hard-errors on `FOR UPDATE` with nullable LEFT JOIN |
| `active_jobs_count` incremented at admin approval | Admin can still reject after agreement — count only locks at assignment |
| `GREATEST(0, active_jobs_count - 1)` on decrement | Protects against negative values |
| SSE over WebSocket for notifications | Unidirectional, HTTP/1.1 compatible, no extra library needed for push |
| Redis pub/sub as SSE broadcast layer | Decouples notification creation from active connections — works across multiple server instances |
| Dedicated Redis subscriber instance in sse.js | Subscriber blocks the connection — must be a separate ioredis instance |
| Token via `?token=` query param for SSE stream | Browser `EventSource` API cannot send custom headers |
| All triggers fire-and-forget via `setImmediate` | Notification failures never propagate to business logic |
| `multer.memoryStorage()` | No disk writes — buffer → Supabase Storage directly |
| Module-based folder structure | Self-contained — each module is extractable to a microservice |
| Refresh token rotation | Old token invalid after each use — prevents replay attacks |

---

## 📦 Phase 8 — Social Media Integration + Publishing System (Planned)

### Overview
Companies (clients on Mint More) connect their owned social media accounts and publish content to multiple platforms simultaneously from a single dashboard. Freelancers deliver the content, clients approve it, and then publish directly — or schedule it for later — without leaving the platform.

### Supported Platforms
| Platform | API | Supported Content Types |
|----------|-----|------------------------|
| **Facebook** | Facebook Graph API v18+ | Text posts, image posts, video posts, Reels, Stories, link posts |
| **Instagram** | Instagram Graph API | Feed images, Feed videos, Reels, Stories, Carousel posts |
| **YouTube** | YouTube Data API v3 | Videos, Shorts, Community posts |

### Planned Feature Set
- **OAuth 2.0 connect flow** — per platform, per user account (tokens stored encrypted in DB)
- **Token auto-refresh** — silently refresh platform tokens before expiry
- **Multi-platform publish** — one action publishes to all selected platforms simultaneously
- **Platform-specific field mapping** — Instagram needs `caption` + `media_type`, YouTube needs `snippet.title` + `snippet.description` + `status.privacyStatus` — handled transparently
- **Rich content support** — text, single image, video, multi-image carousel, reels/shorts
- **Hashtag + tag management** — add tags, mentions, location per post per platform
- **Thumbnail support** — custom thumbnails for YouTube/video posts
- **Scheduled publishing** — set a `publish_at` datetime; BullMQ processes it at the right time
- **Post status tracking** — `draft → scheduled → publishing → published → failed` per platform
- **Retry on failure** — failed platform publishes auto-retry up to 3 times
- **Analytics pull** — read-only engagement data (reach, likes, views, comments, shares) per post
- **Draft library** — save content as draft before publishing
- **Admin oversight** — admin can view all client publishing activity

### Planned Tables
```sql
social_accounts          -- connected platform accounts per user (tokens encrypted)
social_posts             -- post content, schedule, overall status
social_post_platforms    -- one row per platform per post (per-platform status + platform post ID)
social_post_media        -- media files for a post (Supabase Storage URLs)
social_analytics         -- pulled engagement metrics (pulled on-demand or via cron)
```

### Planned Routes
```
POST   /social/connect/:platform           -- start OAuth 2.0 flow (redirect to platform)
GET    /social/callback/:platform          -- OAuth callback (exchange code for token)
GET    /social/accounts                    -- list connected accounts
DELETE /social/accounts/:accountId         -- disconnect an account

POST   /social/posts                       -- create post (draft)
PATCH  /social/posts/:postId               -- update draft
POST   /social/posts/:postId/publish       -- publish now to selected platforms
POST   /social/posts/:postId/schedule      -- schedule for a future datetime
POST   /social/posts/:postId/cancel        -- cancel scheduled post
GET    /social/posts                       -- list posts (filter by status/platform)
GET    /social/posts/:postId               -- post detail + per-platform status

GET    /social/analytics/:postId           -- engagement metrics for a post
GET    /social/accounts/:accountId/pages   -- list Facebook pages for an account
```

### Key Technical Decisions (Planned)
- OAuth tokens stored encrypted (AES-256) — never exposed in API responses
- Platform API calls run via BullMQ queue — not in the HTTP request cycle
- Per-platform publish runs in parallel (Promise.allSettled — one platform failing doesn't block others)
- Media uploaded to Supabase Storage first, then URL sent to platform APIs
- YouTube requires separate OAuth scopes — handled in connect flow
- Instagram posting requires a Facebook Page connected to an Instagram Business account

---

## 📦 Phase 9 — AI Tools Integration (Planned)

### Overview
AI-powered content creation tools built directly into Mint More. Clients generate drafts, images, and video scripts using AI models — then hand off to freelancers for refinement, or combine with Phase 8 to publish directly. Usage is tracked per user and deducted from the wallet (Phase 6 credits).

### Planned Tools
| Tool | Provider | Use Case |
|------|----------|----------|
| **Text generation** | OpenRouter (GPT-4o, Claude 3.5, Llama 3) | Blog posts, social captions, ad copy, email drafts, job briefs |
| **Image generation** | Replicate (Flux Pro, SDXL) | Social media graphics, thumbnails, product images, banners |
| **Video script** | OpenRouter | Scripts for Reels, YouTube Shorts, ads, explainer videos |
| **Caption + hashtag suggester** | OpenRouter | Auto-generate captions + hashtags from image or brief |
| **Content repurposing** | OpenRouter | Turn blog post → 5 social captions + email + tweet thread |
| **AI job brief** | OpenRouter | Client types a short prompt → AI fills out the full job description |

### Planned Features
- **BullMQ async queue** — AI generation is async (2–30 seconds); job queued and result stored
- **SSE progress streaming** — client sees real-time status (`queued → generating → done`)
- **Credit system** — each tool consumes credits from the user's wallet (Phase 6)
- **Rate limiting** — max N AI requests per user per hour (configurable per tool)
- **Output persistence** — generated images/videos saved to Supabase Storage; text in DB
- **Generation history** — all outputs saved and retrievable
- **Retry on failure** — transient API errors auto-retry with exponential backoff

### Planned Tables
```sql
ai_generations     -- every generation request, status, result URL or text
ai_usage_log       -- credits consumed per user per action per day
```

### Planned Routes
```
POST   /ai/text/generate           -- generate text (caption, blog, copy, etc.)
POST   /ai/image/generate          -- generate image
POST   /ai/script/generate         -- generate video script
POST   /ai/caption/suggest         -- suggest caption + hashtags from brief or image
POST   /ai/repurpose               -- repurpose content across multiple formats
GET    /ai/generations             -- user's generation history (paginated)
GET    /ai/generations/:id         -- single generation result + status
GET    /ai/usage                   -- credit usage summary for current user
```

---

## ✅ Recent Frontend / Integration Updates

- Job posting now uses a conversational modal in the client dashboard (removed /client/jobs/new page).
- Dashboard nav: removed "Post a Job"; "My Jobs" uses exact route matching to avoid false active state.
- Public categories wired to `GET /categories` (admin categories no longer used client-side).
- Jobs API mapping updated for snake_case responses and create payloads (`budget_type`, `pricing_mode`, `metadata` with `budget_min`/`budget_max`).
- KYC API response unwrapped and mapped from `submissions` into `basic/identity/address` structure with safe defaults.
- Admin users/categories list responses unwrapped and mapped to UI shapes (incl. `freelancer_level`).
- `formatRelativeTime` now guards against null/invalid dates.

---

## 📋 Resume Context (paste into new Claude chat)

```
You are a senior full-stack engineer continuing "Mint More" — a controlled matchmaking SaaS.

TECH: Node.js + Express + PostgreSQL (Supabase Session Pooler) + Redis + Supabase Storage + SSE

DB: host=aws-1-ap-south-1.pooler.supabase.com port=5432 user=postgres.grnnqilqrzlnrtbfrpyx SSL=true

COMPLETED:
- Phase 1:          Foundation (server, DB pool, Redis, middleware, health check)
- Phase 2:          Auth (JWT 15m + refresh 7d, bcrypt, Redis blacklist, RBAC)
- Phase 3:          Profile + KYC (3-level progressive, Supabase Storage, atomic approval)
- Phase 4A:         Admin (user approval, freelancer levels, categories, dashboard)
- Phase 4B:         Jobs (lifecycle, role visibility, metadata JSONB, pricing_mode)
- Phase 4C:         Proposals + Matching (scoring engine, tier notifications, pricing alignment)
- Phase 4C-fix:     Matching rebuilt — SQL fetches role=freelancer only, ALL filters in JS
- Phase 4C-pricing: category_price_ranges, market guidance, pricing score component
- Phase 4D:         Negotiation (lock, 2-round negotiate, fallback, admin approval, assignment)
- Phase 4E:         Auto matching + visibility control
- Phase 5:          In-app notification system (SSE + Redis pub/sub + notification triggers)

KEY RULES:
- NOT a bidding marketplace — controlled matchmaking + structured negotiation
- Matching auto-triggers on job create (open) and publish via setImmediate (non-blocking)
- Freelancers ONLY see jobs they are in job_matched_candidates for (404 otherwise)
- Matching: SQL = role=freelancer only — no other SQL filters — all eligibility in JS
- rank 1 → position='primary'   → jobs.active_freelancer_id
- rank 2 → position='backup'    → jobs.backup_freelancer_id
- rank 3+ → position='candidate'
- FOR UPDATE must NEVER be used with LEFT JOIN — lock jobs row only
  (SELECT * FROM jobs WHERE id=$1 FOR UPDATE)
- active_jobs_count = current workload (+1 on admin approve, -1 on decline/complete/cancel)
- jobs_completed_count = historical total (fairness scoring only)
- Max negotiation rounds = 2
- Job locking: first valid negotiation initiation locks the job
- Fallback: backup promoted if primary fails, re-matching if no backup
- requireApproved on all marketplace routes
- Response shape: { success, message, data } via apiResponse.js
- AppError for operational errors, global errorHandler catches all
- admin.routes.js imports jobController and calls jobController.adminListAllJobs
- Notifications: in-app SSE only (NOT WhatsApp, NOT email — freelancers use app/website only)
- All notification triggers use setImmediate — post-commit, non-blocking
- SSE token passed as ?token= query param (EventSource cannot set headers)
- Redis SSE channel: 'mint_more:notifications'
- Notification failures NEVER affect business logic

RECENT UPDATES:
- Client job posting now uses a modal in dashboard; /client/jobs/new removed
- Nav: removed "Post a Job"; "My Jobs" uses exact match
- Public categories wired to GET /categories (admin categories not used client-side)
- Jobs API mapping handles snake_case and create payloads (budget_type, pricing_mode, metadata budget_min/max)
- KYC response unwrapped from { success, data } and mapped from submissions
- Admin users/categories unwrapped and mapped (incl. freelancer_level)
- formatRelativeTime handles null/invalid safely

PLANNED PHASES:
- Phase 6: Wallet + Escrow (Razorpay, wallet credit/debit, escrow on job, release on complete)
- Phase 7: Real-time Chat (Socket.io, rooms, persistence, presence)
- Phase 8: Social Media Publishing (Facebook/Instagram/YouTube OAuth, multi-platform post, schedule, analytics)
- Phase 9: AI Tools (OpenRouter text, Replicate image/video, BullMQ queue, credit deduction)

Rules: one phase at a time, complete working code only, no shortcuts.
```