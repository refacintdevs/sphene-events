# Progress Tracker

Update this file after every meaningful implementation
change. Treat it as a running journal of where the
project is and how it got there.

## Current Phase

- Phase 1 — University Implementation. Phase 0 sealed and deployed. Building Phase 1 under final-year project constraints documented in academic-context.md. 4 weeks to submission. Weekly plan in phase-1-roadmap.md.

## Current Goal

- Phase 1 Week 1 — customer-facing core + admin spine. First task: extract Phase 0 bug log to docs/bug-log.md while details are fresh (Unit 1.0).

## Completed

- Project planning and scope definition (Phase 1 MVP
  scope confirmed: 3 categories, Lagos only).
- Stack decisions finalized (see `architecture.md`).
- UI direction confirmed: light + dark with toggle,
  Fraunces + Plus Jakarta Sans, terracotta/amber primary.
- Context documentation drafted (this folder).
- **Phase 0 Unit 1: Next.js project scaffold.** TypeScript,
  Tailwind v4, ESLint, App Router, Turbopack, src/
  directory. AGENTS.md and CLAUDE.md configured. Git
  initialized and pushed.
- **Phase 0 Unit 2: Theme system & dark/light toggle.**
  Tailwind v4 CSS-first tokens in `globals.css`, semantic
  color system (terracotta light / amber dark), Fraunces +
  Plus Jakarta Sans loaded via next/font/google, next-themes
  provider with system default and class-based toggle.
  Test page proves all tokens, both fonts, and theme
  switching work end to end. `npm run build` passes.
- **Phase 0 Unit 3: shadcn/ui initialization + MVP components.**
  `components.json` (Tailwind v4, CSS-first, no config file),
  `src/lib/utils.ts` with `cn()`, shadcn CLI 4.8.0, all 23 MVP
  components installed in `src/components/ui/`. `globals.css`
  untouched. `lucide-react` installed; theme-toggle SVG icons
  replaced with `Sun`/`Moon` from lucide. Test page updated
  with Button, Card+Badge, Dialog, and Skeleton demo section.
  One generated bug fixed: `calendar.tsx` `table` → `month_grid`
  (react-day-picker v10 API rename). `npm run build` passes.
- **Phase 0 Unit 4: Prisma + Neon PostgreSQL database setup.**
  Prisma 7.8.0 + `@prisma/adapter-neon` + `@neondatabase/serverless`
  installed. `prisma/schema.prisma` — full schema (9 enums, 11 models)
  matching `database-schema.md`. `prisma.config.ts` — Prisma 7 config
  file with `DIRECT_URL` for migrations, `migrations.seed` for seed
  command. `src/lib/db.ts` — `PrismaNeon` singleton with pooled
  `DATABASE_URL` for runtime queries. Initial migration
  `20260525154803_init` applied to Neon (Frankfurt). Schema validated.
  Seed script (`prisma/seed.ts`) populates 5 users (1 admin, 2 customers,
  3 vendor users), 3 vendor profiles (Folake's Kitchen / CATERING /
  APPROVED, Tunde Lens Studio / PHOTOGRAPHY / APPROVED, House of Lush /
  DECORATION / APPROVED), 6 services, 12 portfolio items, 1 booking
  (SE-2026-0001, status PAID, whatsappRevealed true) with 1 Payment row
  (status HELD, amountKobo 15,000,000). `npm run build` passes.
  `prisma migrate status` confirms 1 migration applied, database in sync.
  **Note:** To inspect data use `prisma studio`:
  `npx dotenv -e .env.local -- npx prisma studio`
- **Phase 1 Unit 1.0: Bug log extraction.** Created `docs/bug-log.md`
  populated with 8 Phase 0 bugs (seed deviation, actions.ts return type,
  mobile sheet, scroll detection, Prisma 7 DIRECT_URL eager eval, cls
  pager trap, .gitignore wildcard, LF/CRLF). Each bug has full detail:
  ID, Phase/Unit, Date, Description, Root Cause, Fix, Lesson Learned.
  Captured while session memory was fresh.
- **Phase 1 Unit 1.1: Cloudinary setup.** Free-tier account created
  (cloud name: dxiyxab2x). Unsigned upload preset `eventiq_unsigned`
  configured for portfolio uploads (folder eventiq/portfolio, max 5 MB).
  Five `CLOUDINARY_*` env vars added to `.env.local` and Vercel (all
  three environments). `next.config.ts` updated with
  `images.remotePatterns` for `res.cloudinary.com` and `placehold.co`.
  Manual upload tested in Cloudinary Media Library; verified working.
- **Phase 0 Unit 5: Clerk authentication with lazy user sync.**
  `@clerk/nextjs@7.4.1` installed. `src/proxy.ts` — Next.js 16 proxy
  (replaces deprecated `middleware.ts`); `clerkMiddleware()` with
  `createRouteMatcher` for public routes (`/`, `/sign-in`, `/sign-up`,
  `/api/webhooks`); unauthenticated access to protected routes redirects
  to `/sign-in?redirect_url=<path>`. `src/app/layout.tsx` — `ClerkProvider`
  added inside `ThemeProvider` with `hsl(var(--*))` appearance tokens
  (auto-follows dark/light mode via CSS variables). Sign-in/sign-up pages
  at `(auth)/sign-in/[[...sign-in]]` and `(auth)/sign-up/[[...sign-up]]`
  with minimal centered layout (no nav, no theme toggle). `src/lib/auth.ts`
  — `ensureUser()` (upsert on first auth), `getCurrentUser()` (lazy sync
  trigger), `requireAuth()`, `requireRole()`. `src/lib/errors.ts` —
  `AuthError`, `DatabaseSyncError`. `src/lib/validators/user.ts` — Zod
  schema for user sync input. Test page updated with auth state section
  showing email, full name, role, DB User ID, Clerk ID, sign-out button.
  Context docs updated: `middleware.ts` → `proxy.ts` across all spec files.
- **Phase 0 Unit 6: Role selection flow.**
  `src/app/onboarding/role/page.tsx` — Server Component;
  reads `currentUser().publicMetadata.role` (not `auth()` — see
  code-standards.md Clerk section); redirects away if role already set or
  if admin; otherwise renders role selection UI. `src/app/onboarding/role/actions.ts`
  — `setUserRole("CUSTOMER" | "VENDOR")` Server Action; Zod guards against
  ADMIN input; DB write first, Clerk metadata mirror second (partial failure
  logs but does not fail action); redirects to `/` on success (TODO Phase 1:
  VENDOR → `/vendor/onboarding`). `src/app/onboarding/role/_components/RoleCards.tsx`
  — client component; two keyboard-accessible card buttons; CUSTOMER
  (terracotta icon tint) + VENDOR (jade icon tint); `useTransition` for
  inline loading state; returns AUTH_REQUIRED code → router.push to /sign-in,
  INTERNAL_ERROR → Sonner toast; unexpected throws → generic Sonner toast.
  `src/app/onboarding/layout.tsx` — centered layout with ThemeToggle for
  all `/onboarding/*` pages. `context/code-standards.md` updated with
  Clerk subsection (auth() vs currentUser(), clerkClient() factory,
  atomicity pattern). `npm run build` passes.
- **Phase 0 Unit 8: Real landing page.** Replaced test page with full
  home page — sticky nav (scroll-aware, mobile sheet), hero with
  functional search (→ /vendors?category=X&q=Y), how-it-works, featured
  categories with live DB counts, featured vendors fetched from DB (first
  real full-stack data read), trust signals, vendor CTA, footer. ISR with
  1h revalidate. Two runtime bugs (mobile sheet, scroll detection) caught
  in visual review and fixed. Components in `src/components/landing/`,
  `src/components/nav/`, `src/components/vendor/`. `npm run build` clean.

## In Progress

- None. Phase 0 complete.

## Next Up

Phase 1 Week 1 remaining units, then Week 2:

1. **Unit 1.2:** Vendors browse page (`/vendors`) — URL-driven filters,
   pagination, empty states, Server Component.
2. **Unit 1.3:** Vendor detail page (`/vendors/[slug]`) — hero, services,
   portfolio grid, reviews section (empty), 404 for unverified.
3. **Unit 1.4:** Admin shell + verification queue — role-gated `/admin/*`,
   approve/reject/request-info on pending vendors (opens AD-005).
4. **Unit 1.5:** Seed data expansion — 5+ rows per core table for
   Requirement 3; varied booking statuses for realistic dashboards.

**Week 2 preview:** vendor onboarding (4-step form), booking flow
(4-screen), Paystack sandbox integration, vendor bookings dashboard,
customer dashboard skeleton.

## Open Questions

- University grading rubric not obtained. Plan based on requirements document only. Re-prioritize if rubric becomes available.
- Cloudinary account: free tier or paid from day one?
  Resolve before Phase 1 portfolio upload work.
- Resend domain verification: which domain to use for
  transactional email? Defer to before Phase 1
  notification work.
- Paystack: business account ready, or test mode only
  for MVP build? Test mode is fine until launch prep.
- Admin role assignment: which Clerk user(s) get admin
  on day one? Need at least one before vendor
  verification flow can be tested.
- Domain name and brand: "EventIQ" is the confirmed
  name (renamed from "Sphene Events" on 2026-05-28).
  Finalize domain before public launch preparation.

### Deferred / Loose Ends

- Manual rename tasks still pending: (1) `EMAIL_FROM`
  in `.env.local` (update to `EventIQ <hello@eventiq.com>`),
  (2) Clerk dashboard app name (verify wordmark reads
  EventIQ in hosted Clerk UI).
- Clerk is on test keys — a production Clerk instance
  is required before real-user launch.
- Real domain (`eventiq.ng` or client choice) to be
  attached to Vercel when confirmed; current URL is
  `sphene-events.vercel.app` (cosmetic only).
- EventIQ namespace / trademark concern pending client
  confirmation — multiple existing event-software
  companies use the name.
- Font preload console warnings: harmless, defer cleanup.
- `lib/env.ts` startup env validation not yet created —
  add before Phase 1 ships.

## Architecture Decisions

| Date     | Decision                                        | Why                                                                                |
| -------- | ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| Phase 0  | Use Clerk for auth instead of NextAuth          | Faster setup, hosted UI, built-in role metadata, better mobile experience.         |
| Phase 0  | Use Neon for PostgreSQL                         | Serverless-friendly, free tier sufficient for MVP, branch databases for previews.  |
| Phase 0  | Money stored in kobo as `Int`                   | Avoids float precision errors; standard Paystack convention.                       |
| Phase 0  | Manual payouts in MVP, automatic in Phase 2     | Reduces Paystack Subaccount setup complexity for launch; admin retains control.    |
| Phase 0  | Reveal WhatsApp after deposit instead of in-app messaging | Matches Nigerian vendor behavior; reduces MVP scope without losing utility. |
| Phase 0  | 3 categories + Lagos only at launch             | Focuses liquidity in one city/segment; easier to seed supply.                      |
| Phase 0  | Light + dark mode from day one                  | Easier to bake in than retrofit; user preference signal.                           |
| Phase 0  | Fraunces + Plus Jakarta Sans                    | Distinctive typography that avoids generic SaaS look (no Inter).                   |
| 2026-05-25 | **AD-001: Prisma 7 + @prisma/adapter-neon** — `PrismaNeon` (WebSocket transport via `@neondatabase/serverless`) chosen over `PrismaNeonHttp` because it supports transactions, which we require for atomic booking + payment writes. `PrismaNeonHttp` would avoid persistent connections entirely but does not support multi-statement transactions. WebSocket still has cold-start cost, but is the correct trade-off for our financial integrity requirements. Runtime queries use `DATABASE_URL` (pooled via PgBouncer). Migrations use `DIRECT_URL` (direct TCP) via `prisma.config.ts`. | Prisma 7 removed implicit URL config from `schema.prisma`; adopting now avoids a future major-version migration. Neon is our committed provider. |
| 2026-05-25 | **AD-002: Single `.env.local` source of truth** — All environment variables live in `.env.local`. Prisma CLI does not read `.env.local` by default. Rather than creating a duplicate `.env` file, we load vars via `dotenv-cli` (`npx dotenv -e .env.local --`) or inline PowerShell env injection before any `npx prisma` command. `--env-file .env.local` is NOT sufficient in Prisma 7 because `prisma.config.ts` is evaluated before CLI flags are processed. | Avoids env drift between `.env` and `.env.local`; keeps one canonical file. |
| 2026-05-26 | **AD-003: Lazy user sync over webhook for MVP** — Instead of using a Clerk webhook handler at `/api/webhooks/clerk` to create `User` rows on `user.created` events, we lazy-sync inside `getCurrentUser()` (`src/lib/auth.ts`). The first time an authenticated user calls `getCurrentUser()`, `ensureUser()` upserts a `User` row by `clerkId`. This avoids needing a public webhook URL during local development (no ngrok required) and works identically in dev and production. The webhook handler can be added later when deploying to Vercel for redundancy, but is not required for correctness — lazy sync is sufficient. Trade-off: a user who signs up but never opens the app has no DB row, which is fine because they're not actually using the platform yet. | Removes ngrok/tunneling complexity from local dev. Same code path in dev and prod. |
| 2026-05-27 | **AD-004: DB-first, Clerk-mirror atomicity for role writes** — When `setUserRole()` updates a user's role, it writes to two systems: our DB (`User.role`, the source of truth) and Clerk `publicMetadata.role` (the mirror for fast proxy checks). Order matters. Pattern: DB write first; if it succeeds, attempt Clerk write; if Clerk fails, log the error but DO NOT roll back the DB. The DB has the correct role; Clerk metadata is stale until a future re-sync or the next sign-in. The proxy will use DB role for authorization once role-gated routes land. The alternative (Clerk-first or transactional rollback) would either route based on stale metadata or require two-phase commit complexity unjustified at MVP scale. | Source-of-truth clarity beats two-phase commit complexity. Drift window is acceptable for non-financial state. |
| 2026-05-27 | **AD-005: Defer route groups and role-gated proxy to Phase 1** — Unit 7 was originally planned as the final structural unit of Phase 0: create route groups `(public)`/`(customer)`/`(vendor)`/`(admin)` with role-gated logic in `proxy.ts`. Decision: defer. Building empty route group folders with no real content would be speculative scaffolding for dashboards not yet designed. The role-gating logic in `proxy.ts` will be added incrementally when Phase 1 features (vendor onboarding, customer dashboard) need it. Trade-off: `proxy.ts` will be edited multiple times during Phase 1 instead of once now. Acceptable because role-gating decisions are better made under real feature requirements than in the abstract. The `(public)`/`(customer)`/`(vendor)`/`(admin)` pattern documented in `architecture.md` remains the intended end state — we just build it incrementally rather than upfront. | Speculative scaffolding adds maintenance cost without value. Build when needed. |
| 2026-05-28 | **AD-006: ISR on landing page (1h revalidate)** — The home page fetches vendor counts and featured vendors from the DB. `export const revalidate = 3600` enables ISR: served from cache, regenerated in the background on the first request after each 1-hour window. Trade-off: up to 1 hour of stale data after a vendor is approved. Acceptable for MVP because vendor approvals are manual and infrequent. Alternative (`force-dynamic`) would hit the DB on every page view — unnecessary load for a public marketing page. | Fresh-enough data without per-request DB load. |
| 2026-06-02 | **AD-007: Server-Sent Events over WebSocket for chat** — Real-time chat uses one-way SSE (server → client) instead of WebSocket. Client sends messages via standard POST. Decision driven by: (1) simplicity in a 4-week academic timeline, (2) Next.js native support without separate server infrastructure, (3) sufficient for one-to-one booking-scoped chat. WebSocket considered and rejected for this scope. Documented in chapter-4-evidence.md as a legitimate alternative satisfying Requirement 6 (university requirements doc lists WebSocket/Socket.io/Laravel Reverb as examples, not a closed list). | One-way real-time is enough; cuts implementation complexity substantially. |

## Session Notes

- Context files were created collaboratively before
  any code was written. The conversation that
  produced them lives in the AI assistant chat,
  but the final source of truth is these files.
- The product is a marketplace, not a CRM or vendor
  software. When in doubt about scope, the answer
  is "ship less, validate, then expand."
- Phase 2 features are explicitly out of scope for
  MVP. Resist requests to add them prematurely —
  document them in `project-overview.md` under
  Phase 2 instead.
- Phase 0 Units 1-4 complete (May 25, 2026).
- Phase 0 Unit 5 complete (May 26, 2026). Clerk account
  was pre-created; keys were already in `.env.local`.
- **Key decision recorded**: Next.js 16 deprecated
  `middleware.ts` in favor of `proxy.ts`. All auth
  protection lives in `src/proxy.ts`; all spec docs
  updated accordingly.
- Phase 0 Units 1-6 complete (May 25-26, 2026).
  Two long sessions. Auth flow + role selection verified end-to-end
  with fresh user sign-up.
- 2026-05-27: Phase 0 Units 5-6 completed in prior session. Unit 7
  deferred per AD-005. Continuing to Unit 8 (landing page) directly.
  After Unit 8, Phase 0 is sealed and Phase 1 opens.
- 2026-05-28: Phase 0 complete. All 8 units done (7 deferred). Landing
  page is the first full-stack surface (DB → Prisma → Server Component
  → UI). Visual review caught two runtime bugs the build missed —
  reinforces: UI units require browser verification, not just clean
  builds. Known cosmetic issue: font preload console warnings (harmless,
  defer cleanup). Ready for Phase 1.
- 2026-05-28: First Vercel production deployment successful. Live at
  sphene-events.vercel.app (subdomain still says sphene-events;
  eventiq.vercel.app was taken — cosmetic, real domain comes later).
  Build passed first try with the postinstall prisma generate fix. Full
  stack verified in production: landing page renders DB-seeded vendors
  (Folake's Kitchen, Tunde Lens Studio, House of Lush), auth sign-in
  works against production Neon DB. Shared with client as an early
  preview with sample data.
- 2026-06-02: Phase 1 opened under academic constraints. Project re-scoped from indefinite production marketplace to 4-week dissertation deliverable. Three new planning docs added: academic-context.md (constraints), phase-1-roadmap.md (week-by-week), chapter-4-evidence.md (requirement tracking). Live Vercel deployment maintained as continuous demo URL.
- 2026-06-02: Phase 1 Unit 1.0 complete. Bug log extracted while session memory was freshest.
- 2026-06-02: Phase 1 Unit 1.1 complete. Cloudinary free-tier account active; next.config.ts updated.