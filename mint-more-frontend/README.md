# Mint More — Frontend

A controlled freelancer matchmaking SaaS platform. Built with Next.js 14, TypeScript, Tailwind CSS, and TanStack Query.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Data Fetching:** TanStack Query v5
- **Forms:** React Hook Form + Zod
- **Real-time:** EventSource (SSE)
- **Icons:** Lucide React
- **HTTP:** Axios with interceptors

---

## Getting Started

### Prerequisites

- Node.js 18+
- `mint-more-backend` running at `http://localhost:5000`

### Install & Run

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Visit `http://localhost:3000`

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

## Project Structure

```
src/
├── app/
│   ├── (marketing)/          # Landing page
│   ├── (auth)/               # Login, register, admin-access
│   ├── (dashboard)/
│   │   ├── client/           # Client dashboard + jobs + notifications
│   │   ├── freelancer/       # Freelancer dashboard + jobs + kyc + profile
│   │   └── admin/            # Admin dashboard + users + jobs + kyc + deals + categories
│   ├── layout.tsx            # Root HTML shell
│   └── providers.tsx         # QueryClient + auth bootstrap
├── components/
│   ├── layout/               # Navbar, Footer, Sidebar, DashboardShell
│   ├── marketing/            # HeroBand, FeatureGrid, HowItWorks, Pricing, CTA
│   ├── notifications/        # NotificationBell, NotificationPanel
│   ├── jobs/                 # JobPostModal
│   └── kyc/                  # KycStepper, BasicKycForm, IdentityKycForm, AddressKycForm
├── lib/
│   ├── api/                  # Axios instance + all API modules
│   ├── stores/               # authStore, notificationStore
│   ├── hooks/                # useAuth, useSSE, useNotifications
│   └── utils/                # cn, formatters
├── types/                    # All TypeScript types
└── middleware.ts             # Route protection
```

---

## Roles & Dashboards

There are three user roles, each with a completely separate dashboard and sidebar navigation.

### Client — `/client`
- Post jobs via a 4-step conversational modal
- View all jobs with status filters
- Negotiate with freelancers (accept / counter / reject)
- Real-time notifications

### Freelancer — `/freelancer`
- View only jobs matched to them
- Initiate and respond to negotiations
- Complete 3-step progressive KYC
- View profile with skills, bio, rating

### Admin — `/admin`
- View platform stats and pending action alerts
- Approve / reject / suspend users
- Set freelancer levels (beginner / intermediate / experienced)
- Run AI matching on published jobs
- Review KYC submissions
- Approve or reject deals
- Manage job categories and market price ranges

---

## Authentication

Tokens are stored in `localStorage`. The Axios interceptor attaches `Authorization: Bearer <token>` to every request. On 401, it automatically refreshes using the stored refresh token and retries the original request.

### Admin login

Admins log in at `/admin-access` — a secret route not linked anywhere in the UI. Using non-admin credentials here returns "Access denied".

---

## Key Decisions

**Tokens in localStorage, not cookies** — The backend requires `Authorization` headers. httpOnly cookies can't be read by JavaScript so localStorage is used instead.

**Sidebar hydration** — Zustand reads sessionStorage asynchronously. The sidebar shows a skeleton until `useEffect` fires, then renders the correct role nav with no flash.

**Job posting as a modal** — The original `/client/jobs/new` page was replaced with a 4-step conversational modal for a better UX.

**Snake_case from backend** — The backend returns `full_name`, `kyc_level`, `created_at` etc. Types match snake_case directly. Components use `user.full_name` not `user.fullName`.

**Categories first** — Admins must create at least one category at `/admin/categories` before clients can post jobs.

**SSE reconnects up to 5 times** — After 5 failures the connection stops. A page refresh restarts it.