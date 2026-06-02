# Phase 1 Roadmap — 4 Weeks to Submission

This is the working plan for Phase 1. Read alongside
`academic-context.md` (the constraints) and
`chapter-4-evidence.md` (the deliverable tracking).

Weeks are sequential; each week's units build on the
previous week's. Slipping a week is acceptable as long
as the buffer in Week 4 is preserved.

## Strategy

- **Breadth over depth.** Three roles, many flows.
  Functional beats polished.
- **Continuous deployment.** Every unit ends with a
  push to main; Vercel auto-deploys. Demo-ready URL
  always exists.
- **Documentation as we build.** Every unit produces
  Chapter 4 evidence (screenshots, code snippets,
  decisions) at the time of build, not retroactively.
- **Reserved buffer.** Week 4 is half features, half
  stabilization. Bug fixes and demo prep happen there
  by design, not as an accident.

## Week 1 — Customer-facing core + admin spine

Goal: a customer can discover and view vendors; an
admin can see the pending verification queue. This
is the most visible part of the marketplace and the
easiest to demo.

### Unit 1.0 — Bug log extraction

- Create `docs/bug-log.md` populated with Phase 0
  bugs documented from session history.
- Why first: chat memory of these bugs is freshest
  now. Extract before Phase 1 work crowds it out.
- Format: markdown table with ID, Phase/Unit, Date,
  Bug Description, Root Cause, Fix, Lesson Learned.

### Unit 1.1 — Cloudinary setup

- Create free-tier Cloudinary account.
- Configure unsigned upload preset for portfolio
  images (Phase 1 vendor upload).
- Add `CLOUDINARY_*` env vars to `.env.local` and
  Vercel.
- Add `res.cloudinary.com` to `next.config.ts` image
  remote patterns.
- Verify with one manual upload test.

### Unit 1.2 — Vendors browse page (`/vendors`)

- Server Component with filters: category, city,
  date availability (basic), verified-only toggle.
- URL-driven filters (`?category=CATERING&city=Lagos`)
  so back/forward navigation works.
- Pagination (20 per page).
- Empty states (no results, loading).
- Uses existing seed data.

### Unit 1.3 — Vendor detail page (`/vendors/[slug]`)

- Server Component, public route.
- Hero with cover photo + verified badge.
- About, services list with "Book this service" CTA
  (CTA is a stub that links to booking flow — to be
  built in Week 2).
- Portfolio grid.
- Reviews list (empty for seeded data; section
  visible).
- WhatsApp number hidden until booking is paid (to
  be wired in Week 2 booking flow).
- 404 if vendor is unverified or suspended.

### Unit 1.4 — Admin shell + verification queue

- Admin layout under `/admin/*` (route group:
  `(admin)` — opening the AD-005 deferred work now,
  because we need real role-gated routes).
- `proxy.ts` role check: only ADMIN role can access
  `/admin/*`. Customers/vendors get 404 (hide
  existence).
- `/admin` — dashboard overview placeholder.
- `/admin/verifications` — list of pending vendor
  submissions. Approve / reject / request-info
  buttons. Approval writes to DB + Clerk metadata.
- Admin user creation: documented as "set via Clerk
  dashboard" (manual). Update one seed user to
  ADMIN for demo.

### Unit 1.5 — Seed data expansion

- Boost every core table to 5+ rows for university
  requirement #3.
- Currently we have: 6 users, 3 vendors, 6 services,
  12 portfolio items, 1 booking, 1 payment, 0
  reviews, 0 disputes, 0 audit logs, 0 webhook events.
- Add: 2 more vendors (5 total), 4 more services
  (10 total), more bookings in varied states, 5+
  reviews, 5+ audit log entries, 5+ webhook events.
- Bookings should cover statuses: PENDING_VENDOR,
  ACCEPTED, PAID, COMPLETED, DISPUTED — so admin
  and vendor dashboards have real states to render.

### Week 1 deliverables for Chapter 4

- Screenshots: landing → vendors browse → vendor
  detail → admin verification queue.
- Code snippets: filter Server Component, role-gated
  proxy logic.
- DB schema doc with 5+ rows per table.
- Initial bug log committed.

## Week 2 — Booking flow + payments + vendor onboarding

Goal: the core money loop works. Customer can book
and pay; vendor can register, list services, accept
bookings.

### Unit 2.1 — Vendor onboarding (4-step form)

- `/vendor/onboarding` route group + middleware
  rule (VENDOR role only).
- Multi-step form per `feature-specs.md` section 2:
  business basics → location/contact → verification
  docs → bank details.
- Cloudinary uploads for verification docs and
  portfolio (uses Unit 1.1 setup).
- Final submit sets `verificationStatus = PENDING`.
- "Under review" status page after submission.

### Unit 2.2 — Booking flow (customer)

- 4-screen flow per `feature-specs.md` section 6:
  service+date → review → pay → confirmed.
- URLs preserve state so refresh works.
- Server-side amount calculation (invariant: client
  never posts a price).
- Booking created with status PENDING_VENDOR.
- Email to vendor (stubbed — log to console for now;
  Resend wired in Week 3 or labeled as deferred).

### Unit 2.3 — Paystack integration (sandbox)

- Paystack test mode keys in env vars (local +
  Vercel).
- `/api/payments/initialize` route handler — creates
  transaction, returns access code.
- Customer redirected to Paystack hosted page.
- `/api/payments/callback` — handles return URL.
- `/api/webhooks/paystack` — verifies signature,
  marks payment SUCCESSFUL → HELD, booking PAID.
- `WebhookEvent` table records every event for
  idempotency (already in schema).
- "Demo refund" button on admin booking detail —
  triggers Paystack refund API; demonstrates the
  flow even if the underlying refund isn't fully
  unwound.

### Unit 2.4 — Vendor bookings dashboard

- `/vendor/bookings` — list of bookings for this
  vendor, filterable by status.
- Detail view with Accept / Decline buttons for
  PENDING_VENDOR bookings.
- Server Actions for state transitions.

### Unit 2.5 — Customer dashboard skeleton

- `/dashboard` — customer landing (role-gated).
- `/dashboard/bookings` — list of customer's bookings
  with statuses.
- Booking detail view with "Confirm event completed"
  button on PAID bookings.

### Week 2 deliverables

- Screenshots: vendor onboarding wizard, booking
  flow (each of 4 steps), Paystack hosted page,
  successful payment confirmation, vendor accepting
  booking, customer dashboard.
- Code snippets: payment initialization, webhook
  signature verification, booking state machine
  service code.
- Sandbox payment evidence: Paystack dashboard
  transaction screenshot.

## Week 3 — Chat + reviews + security hardening

Goal: round out demo functionality. Chat is the
biggest unknown; security documentation is the
highest-leverage Chapter 4 content.

### Unit 3.1 — Chat data model + SSE infrastructure

- New tables: `Conversation`, `Message` (added in
  Week 3, requires `database-schema.md` update +
  migration).
- Conversation is tied to a Booking (one-to-one).
- Messages have sender, recipient, body, sent_at,
  read_at.
- SSE endpoint: `/api/chat/[bookingId]/stream` —
  server-sent events of new messages for this
  booking.
- POST endpoint: `/api/chat/[bookingId]/messages` —
  send a message.

### Unit 3.2 — Chat UI

- Chat panel on booking detail (both customer and
  vendor sides see it).
- Message list (scrollable, newest at bottom).
- Input + send.
- Read receipts via simple `read_at` timestamps.
- Unread badge on dashboard nav.
- Typing indicator: deferred unless time permits
  (it's polish, not core).

### Unit 3.3 — Reviews flow

- Customer can leave a review on COMPLETED bookings.
- Review form on `/dashboard/bookings/[code]/review`.
- Review displays on `/vendors/[slug]`.
- One review per booking enforced (DB constraint).

### Unit 3.4 — Security implementation + documentation

This unit produces the bulk of Chapter 4 Requirement
#4 evidence. It's documentation-heavy.

- Document Clerk's role: auth, password hashing,
  session management. (Clerk does the work; we
  document it.)
- Add **rate limiting** middleware: Upstash
  Redis-based or simple in-memory per-route limits
  on `/api/auth/*` and `/api/payments/*`.
- Add **CSRF documentation**: Next.js App Router +
  Server Actions are CSRF-resistant by design;
  document why. POST handlers verify origin.
- Add **CORS configuration**: documented for any
  cross-origin API access (current MVP has none).
- `SecurityLog` table (already in schema as
  `AuditLog`) — extend writes to cover failed
  login attempts (Clerk webhook + our handler),
  blocked rate-limit hits, admin actions, payment
  events.
- `lib/env.ts` startup validation (the deferred
  task) — fails fast if env vars are missing.
  This is also a Chapter 4 talking point: "the
  application validates configuration at boot
  via a Zod schema."

### Unit 3.5 — System architecture diagram

- Produce a diagram showing: browser → Vercel
  edge → Next.js (Server Components + API routes)
  → Prisma → Neon Postgres → Cloudinary →
  Clerk → Paystack → SSE channel.
- Save as `docs/architecture-diagram.png` (or SVG).
- Tools: draw.io, Excalidraw, or Mermaid (Mermaid
  is text-based, version-controllable).

### Week 3 deliverables

- Screenshots: chat in action (two browser windows
  side-by-side), review form, review on vendor
  page, security log entries in admin view.
- Architecture diagram.
- Code snippets: SSE endpoint, message handler,
  rate limit middleware.

## Week 4 — Testing, stabilization, Chapter 4 writeup, demo prep

Goal: nothing breaks. Chapter 4 is written. Demo is
rehearsed.

### Unit 4.1 — Testing

- Add Vitest (or Jest) to the project.
- Write a *representative* sample of unit tests
  (target: 8-15 tests across:
  - Money formatting (`formatNaira`)
  - Booking state machine transitions
  - Auth helpers (`requireAuth`, `requireRole`)
  - Webhook signature verification
  - One or two service functions)
- Generate test report (passing/failing counts).
- Manual test case tables (CSV or markdown):
  - Security test cases (unauthorized access to
    protected routes, role escalation attempts)
  - Payment test cases (success, failure, webhook
    replay, refund)
  - Chat test cases (message delivery, read receipt
    update, unread count)
- Bug log: continue extending from Unit 1.0; capture
  any new bugs found during Phase 1.

### Unit 4.2 — Chapter 4 writeup

- Use `chapter-4-evidence.md` as the index.
- Section-by-section, gather screenshots and code
  snippets, write the prose.
- Have Claude (or Claude Code) help draft prose
  from the architecture decisions in
  `progress-tracker.md`.

### Unit 4.3 — Demo rehearsal

- Write a demo script: exact sequence of actions
  to show all three roles + all key features in
  ~15 minutes.
- Run through twice. Identify and fix any blockers
  (a screen that 404s, a button that doesn't work).
- Have a contingency plan if a feature fails live
  (screenshot fallback).

### Unit 4.4 — Final stabilization

- Anything that surfaces in rehearsal: fix or
  document.
- Final Vercel deployment locked.
- No new features in the final 48 hours.

## Slippage policy

If Week N falls behind:

- Week N+1 absorbs the overflow by cutting the LEAST
  visible item (look at what doesn't appear in the
  demo script).
- Week 4 buffer is NEVER touched. If we're slipping
  in Week 3, cut features, not stabilization.

## Out of scope (explicit)

These are NOT built in Phase 1, regardless of demand:

- Mobile native apps
- Vendor subscription tiers / featured placements
- Public pricing page
- Calendar sync (Google)
- Bulk booking / corporate accounts
- Vendor responses to reviews
- Email/SMS notifications beyond the bare minimum
- Multi-currency
- Production Clerk instance (stays on test keys)
- Real domain attachment (stays on
  sphene-events.vercel.app)
- Multi-city support (Lagos only)
- Categories beyond Catering / Decoration /
  Photography
- AI-powered features beyond the chatbot demo
