# Chapter 4 — Evidence Tracker

This document maps every Chapter 4 (Implementation)
requirement to the artifact that will satisfy it.
Each row tracks what evidence is needed, what form
it takes, which Phase 1 unit produces it, and the
current status.

When writing Chapter 4 prose, walk this table top to
bottom and pull from the listed artifacts.

## Status Legend

- ✅ Done — evidence exists in the repo or on Vercel
- 🚧 In Progress — partially produced
- ⏳ Planned — scheduled for a specific Phase 1 unit
- ⚠️ At Risk — depends on something uncertain
- ❌ Not Possible — explicitly out of scope or
  unachievable; will be documented as such

## Evidence Storage Conventions

- **Screenshots**: `docs/screenshots/<feature>/<n>.png`
  with filenames like `01-landing-light.png`,
  `02-vendor-detail.png`. Take on the live Vercel
  URL, not localhost, so they match what the
  supervisor sees.
- **Code snippets**: extracted to
  `docs/code-snippets/<filename>.ts` (or `.tsx`).
  Keep them small (15–40 lines each), focused on
  the function the requirement asks for.
- **Diagrams**: `docs/architecture-diagram.png` (or
  `.svg`). If Mermaid, the source goes in
  `docs/architecture-diagram.mmd`.
- **Tables**: `docs/test-cases.md` and
  `docs/bug-log.md` — markdown tables that paste
  cleanly into the dissertation.
- **Prose drafts**: `docs/chapter-4-draft/<section>.md`
  — written incrementally during the build, not
  retroactively.

## Requirement 1 — Working code for all modules + screenshots

| Module | Status | Source unit | Screenshot path |
| --- | --- | --- | --- |
| User (auth, sign-up, sign-in, role select) | ✅ | Phase 0 Units 5-6 | `docs/screenshots/auth/` |
| Landing / discovery | ✅ | Phase 0 Unit 8 | `docs/screenshots/landing/` |
| Vendor browse | ⏳ | Phase 1 Unit 1.2 | `docs/screenshots/vendors-browse/` |
| Vendor detail | ⏳ | Phase 1 Unit 1.3 | `docs/screenshots/vendor-detail/` |
| Vendor onboarding | ⏳ | Phase 1 Unit 2.1 | `docs/screenshots/vendor-onboarding/` |
| Booking | ⏳ | Phase 1 Unit 2.2 | `docs/screenshots/booking/` |
| Payment | ⏳ | Phase 1 Unit 2.3 | `docs/screenshots/payment/` |
| Chatbot | ⏳ | Phase 1 Unit 3.1-3.2 | `docs/screenshots/chat/` |
| Reviews | ⏳ | Phase 1 Unit 3.3 | `docs/screenshots/reviews/` |
| Admin verification | ⏳ | Phase 1 Unit 1.4 | `docs/screenshots/admin/` |

Screenshots are taken on the live Vercel deployment
in both light and dark modes where applicable.

## Requirement 2 — Database schema + ORM tables

| Item | Status | Location |
| --- | --- | --- |
| Final schema (Prisma) | ✅ | `prisma/schema.prisma` (11 models, 9 enums) |
| New chat tables | ⏳ | `Conversation`, `Message` added Unit 3.1 |
| Migration history | ✅ | `prisma/migrations/` |
| Schema documentation | ✅ | `context/database-schema.md` |
| ERD diagram | ⏳ | `docs/erd.png` — generated via `prisma-erd-generator` or hand-drawn |

The university requirements doc lists tables named:
`users`, `vendors`, `events`, `vendor_requests`,
`quotes`, `bookings`, `payment_transactions`,
`conversations`, `messages`, `security_logs`.

Our Prisma schema uses domain-driven naming that does
not 1:1 match. The mapping is documented in
`academic-context.md` under "Schema-to-Requirement
Mapping" and must be defensible in Chapter 4 prose:

- `users` → `User`
- `vendors` → `VendorProfile`
- `events` → not a separate table; an "event" is the
  date/location/guest count attached to a `Booking`
- `vendor_requests` → a `Booking` in `PENDING_VENDOR`
  status
- `quotes` → a snapshot of `Service.priceKobo`
  captured into `Booking.totalAmountKobo`
- `bookings` → `Booking`
- `payment_transactions` → `Payment`
- `conversations` → `Conversation` (Unit 3.1)
- `messages` → `Message` (Unit 3.1)
- `security_logs` → `AuditLog` (extended Unit 3.4)

Chapter 4 prose explains the naming mapping clearly
and defends the normalization choice.

## Requirement 3 — Sample populated data (5+ rows per core table)

| Table | Current rows | Target | Unit |
| --- | --- | --- | --- |
| User | 6 | ≥5 ✅ | — |
| VendorProfile | 3 | ≥5 | 1.5 |
| Service | 6 | ≥10 | 1.5 |
| PortfolioItem | 12 | ≥5 ✅ | — |
| Booking | 1 | ≥5 (varied statuses) | 1.5 |
| Payment | 1 | ≥5 | 1.5 |
| Review | 0 | ≥5 | 1.5 + 3.3 |
| Conversation | 0 | ≥5 | 3.1 |
| Message | 0 | ≥10 | 3.1 |
| AuditLog | 0 | ≥5 | 1.5 + 3.4 |

Seed data expansion happens in Unit 1.5. The seeded
state must support a clean demo regardless of who
signs up.

## Requirement 4 — Security implementation

| Component | Status | Evidence form | Unit |
| --- | --- | --- | --- |
| Authentication (sign-in, sign-up, JWT/session) | ✅ | Clerk handles; code references in `src/lib/auth.ts` + `src/proxy.ts` + Clerk docs link | Phase 0 Unit 5 |
| Password hashing | ✅ | Clerk uses bcrypt-equivalent; documented in prose, link to Clerk security docs | Phase 0 Unit 5 |
| Role-based access control | ✅ | `src/proxy.ts` + `src/lib/auth.ts` `requireRole()` | Phase 0 Unit 5-6 + Phase 1 Unit 1.4 |
| Encryption (sensitive data) | ✅ | TLS in transit (Vercel + Neon); Clerk encrypts at rest; payment tokens never stored (Paystack references only) | Documented in prose |
| CSRF protection | ⏳ | Next.js Server Actions + same-origin policy; documented + code reference | Unit 3.4 |
| CORS configuration | ⏳ | None required for MVP (no cross-origin); documented as such | Unit 3.4 |
| Rate limiting | ⏳ | Upstash Redis (or in-memory) on `/api/auth/*` and `/api/payments/*` | Unit 3.4 |
| `lib/env.ts` boot-time validation | ⏳ | Zod schema rejects missing env vars at startup | Unit 3.4 |

Code snippets to extract:

- `src/proxy.ts` route protection logic
- `src/lib/auth.ts` `requireRole()` function
- Rate limit middleware (when written)
- `src/lib/env.ts` Zod schema (when written)

## Requirement 5 — Payment gateway integration

| Item | Status | Evidence | Unit |
| --- | --- | --- | --- |
| Gateway chosen | ✅ | Paystack (Nigerian-relevant, documented) | Architecture file |
| API keys configuration | ⏳ | `.env.example` shows variable names, prose explains test vs live | Unit 2.3 |
| Payment flow screenshots | ⏳ | Customer → Paystack → return → booking PAID | Unit 2.3 |
| Webhook handler code | ⏳ | `src/app/api/webhooks/paystack/route.ts` with signature verification | Unit 2.3 |
| Refund logic | ⏳ | Admin refund button + Paystack refund API call + status transition | Unit 2.3 |

Code snippets to extract:

- Payment initialization (server action / route)
- Webhook signature verification
- Refund handler
- Booking ↔ payment state machine transition

Paystack dashboard screenshot (transaction list,
test mode) included as evidence.

## Requirement 6 — Chatbot implementation

| Item | Status | Evidence | Unit |
| --- | --- | --- | --- |
| Real-time technology | ✅ (decided) | Server-Sent Events documented in prose | Unit 3.1 |
| DB structure | ⏳ | `Conversation`, `Message` tables + schema doc | Unit 3.1 |
| Frontend chat UI screenshots | ⏳ | Two-browser-window screenshots showing live exchange | Unit 3.2 |
| Send/receive code | ⏳ | SSE endpoint + message POST handler | Unit 3.1-3.2 |
| Read receipts / unread badge | ⏳ | `read_at` field updates + nav badge | Unit 3.2 |

Code snippets to extract:

- SSE endpoint (`/api/chat/[bookingId]/stream`)
- Message POST handler
- Client-side EventSource subscription
- Unread count query

Constraint to document in prose: SSE is one-way
(server → client). The client sends messages via
standard POST. This is sufficient for chatbot
functionality and substantially simpler than
WebSocket. The university requirements doc lists
"WebSocket / Socket.io / Laravel Reverb" as
examples; SSE is a legitimate alternative for
one-way real-time and is documented as such.

## Requirement 7 — System architecture diagram

| Item | Status | Location | Unit |
| --- | --- | --- | --- |
| Diagram | ⏳ | `docs/architecture-diagram.png` (or Mermaid source) | Unit 3.5 |

Components to depict:

- Browser (customer / vendor / admin)
- Vercel Edge → Next.js (Server Components,
  API routes, middleware)
- Prisma ORM
- Neon PostgreSQL
- Cloudinary (image storage)
- Clerk (auth provider)
- Paystack (payment gateway, external)
- SSE channel (server → browser persistent
  connection)
- TLS at every public network boundary

Annotate the diagram with the trust boundaries
and indicate where Vercel-managed encryption
applies vs application-level encryption.

## Requirement 8 — UI walkthrough per role

| Role | Flow | Status | Unit |
| --- | --- | --- | --- |
| Event Planner / Client | Sign up → role select (CUSTOMER) → browse vendors → view detail → book → pay → chat → review | ⏳ | Multiple |
| Vendor | Sign up → role select (VENDOR) → onboarding → submit → list services → manage bookings → chat → earnings | ⏳ | Multiple |
| Admin | Sign in → admin dashboard → verifications queue → approve vendor → view bookings → resolve dispute → security log | ⏳ | Multiple |

Annotated screenshots produced incrementally as
each unit ships. Annotations call out: the role
being demonstrated, the action being performed,
and the resulting state change in the database.

Note: the requirements doc lists "Event Planner"
and "Client" as separate roles. Our model has
CUSTOMER covering both (a customer is anyone
booking vendors, whether for themselves or for a
client they're planning for). This is documented
in `academic-context.md` and will appear in
Chapter 4 under "Assumptions and constraints."

## Requirement 9 — Testing evidence

| Item | Status | Evidence form | Unit |
| --- | --- | --- | --- |
| Unit test results | ⏳ | Vitest screenshots showing passing suite | Unit 4.1 |
| Security test cases | ⏳ | Markdown table: unauthorized access attempts blocked | Unit 4.1 |
| Payment test cases | ⏳ | Table: success / failure / webhook replay / refund | Unit 4.1 |
| Chat test cases | ⏳ | Table: message delivery, read receipts, unread count | Unit 4.1 |
| Bug log | 🚧 | `docs/bug-log.md` — extracted Unit 1.0, extended through Phase 1 | Unit 1.0 + 4.1 |

Target test count: 8–15 unit tests across critical
helpers and services. Documented as "representative
sample" in Chapter 4, not as full coverage.

Bug log starts with the real bugs caught during
Phase 0:

- Seed deviation in Unit 4 (vendor count + booking
  status mismatch)
- Unit 6 actions.ts return-type misalignment
- Unit 8 mobile sheet not opening
- Unit 8 sticky nav scroll detection not firing
- Prisma 7 `prisma.config.ts` requiring DIRECT_URL
  at module load
- Stray `cls` file from PowerShell pager
- `.gitignore` wildcard hiding `.env.example`
- LF/CRLF noise in PowerShell

New bugs found during Phase 1 will be appended.

## Requirement 10 — Deployment / environment setup

| Item | Status | Location |
| --- | --- | --- |
| Local setup steps | 🚧 | `README.md` (needs expansion in Unit 4.2) |
| Environment variables list | ✅ | `.env.example` + `context/env-variables.md` |
| SSL setup | ✅ | Vercel-managed automatic HTTPS; documented in prose |
| Database migration steps | ✅ | `npm run db:migrate` + `npm run db:seed` in package.json |
| Vercel deployment process | ✅ | Documented in `context/progress-tracker.md` Session Notes + this evidence file |

Production deployment is live at
`sphene-events.vercel.app` (renamed to EventIQ in
content; subdomain is cosmetic).

## Requirement 11 — Assumptions and constraints

Pre-existing decisions to formalize as prose:

- Payment is in Paystack sandbox mode. No real money
  moves. (`academic-context.md`)
- Chatbot supports one-to-one conversations only.
  Tied to a Booking. No group chat.
- All communication is encrypted in transit (TLS
  via Vercel / Neon / Cloudinary / Clerk / Paystack
  all enforced).
- Manual admin approval for new vendors. No
  automated verification.
- Lagos-only at launch; three vendor categories
  (Catering, Decoration, Photography).
- "Event Planner" and "Client" are unified as the
  CUSTOMER role in our data model.
- Clerk operates in test mode for this academic
  build; switching to production keys is documented
  as a post-submission task.
- Web only; no mobile native apps.
- Naira only; no multi-currency.

These get a dedicated subsection in Chapter 4.

## Requirement 12 — Code snippets for critical functions

Extract these to `docs/code-snippets/` during Unit 4.2:

| Function | Source file | Snippet name |
| --- | --- | --- |
| Payment initialization | `src/app/api/payments/initialize/route.ts` | `01-payment-init.ts` |
| Webhook signature verification | `src/app/api/webhooks/paystack/route.ts` | `02-paystack-webhook.ts` |
| SSE event handler (chat) | `src/app/api/chat/[bookingId]/stream/route.ts` | `03-chat-sse.ts` |
| Role-based middleware | `src/proxy.ts` | `04-proxy-rbac.ts` |
| Database transaction (booking + payment) | wherever it lives (service layer) | `05-booking-transaction.ts` |
| Lazy user sync | `src/lib/auth.ts` `ensureUser()` | `06-lazy-sync.ts` |
| Booking state machine | wherever it lives (service or actions) | `07-booking-state.ts` |
| Atomicity pattern (DB + Clerk) | `src/app/onboarding/role/actions.ts` `setUserRole` | `08-role-atomicity.ts` |

Keep each snippet ≤40 lines. The full file is in
the repo; the snippet is the *interesting* part.

## Chapter 4 Draft Structure (suggested)

When writing the chapter, follow roughly this order
so each section builds on the previous:

1. Introduction (one paragraph: what this chapter
   covers)
2. System architecture (Requirement 7 diagram +
   prose explanation)
3. Technology stack and rationale (lift from
   `context/architecture.md` + AD entries)
4. Database design (Requirement 2 + 3 — schema +
   sample data)
5. Authentication and authorization (Requirement 4
   security parts)
6. Core feature implementations:
   - Vendor discovery (Requirement 1, browse + detail)
   - Vendor onboarding (Requirement 1 + UI walkthrough)
   - Booking and payments (Requirement 5)
   - Chatbot (Requirement 6)
7. Security implementation deep-dive (Requirement 4
   remaining)
8. UI walkthrough per role (Requirement 8 —
   annotated screenshots)
9. Testing approach (Requirement 9)
10. Deployment and environment (Requirement 10)
11. Assumptions and constraints (Requirement 11)
12. Code snippets for critical functions (Requirement
    12 — usually goes in an appendix)

Adjust based on what your supervisor wants once the
rubric (if any) arrives.
