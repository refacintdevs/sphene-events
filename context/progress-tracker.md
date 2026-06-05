# Progress Tracker

Update this file after every meaningful implementation
change. Treat it as a running journal of where the
project is and how it got there.

## Current Phase

- Phase 1 — University Implementation. Phase 0 sealed and deployed. Building Phase 1 under final-year project constraints documented in academic-context.md. 4 weeks to submission. Weekly plan in phase-1-roadmap.md.

## Current Goal

- Phase 1 Week 2 — vendor onboarding (4-step form, `/vendor/onboarding`) next.

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
- **Phase 1 Unit 1.2: Vendors browse page (`/vendors`).** Public, server-
  rendered browse page with URL-driven filters and offset pagination.
  `src/proxy.ts` updated — `/vendors(.*)` is now a public route (covers
  Unit 1.3 detail page too). `src/lib/validators/vendor-search.ts` —
  Zod schema with per-field `.catch(default)` for graceful URL degradation
  (deliberate deviation from invariant 5, documented in feature-specs.md).
  `src/services/vendor.ts` — first service-layer file; `searchVendors()`
  queries DB (APPROVED, non-suspended, ≥1 active service), computes
  derived fields app-side (startingPriceKobo, avgRating, reviewCount,
  primaryCategory), applies price-band filter, sorts, paginates (20/page).
  `VendorCard.tsx` extended with optional `avgRating`/`reviewCount`; shows
  "New" chip when no reviews, star rating otherwise. Tailwind v4 canonical
  classes applied (`aspect-4/5`, `bg-linear-to-br`). `EmptyState.tsx` —
  new shared component (heading + description + optional CTA).
  `FilterSidebar.tsx` — server `<form method="GET">` with q text, category
  checkboxes, city select (disabled — Lagos only), price-band radios, date
  input, sort select. `MobileFilterSheet.tsx` — thin "use client" wrapper
  using shadcn Sheet in uncontrolled mode (BUG-003). Vendors layout at
  `app/vendors/layout.tsx` keeps SiteNav mounted during loading.
  `loading.tsx` — shape-matched skeleton grid (6 cards + sidebar).
  `npm run build` passes clean. Scoped deviations noted in
  `feature-specs.md §4`.
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

- Unit 2.1 Slice A complete (schema + plumbing + vendor route gate). Slice B (onboarding form UI) next.

## Next Up

Phase 1 Week 2:

1. **Unit 2.1:** Vendor onboarding (4-step form, `/vendor/onboarding`).
2. **Unit 2.2:** Booking flow (4-screen: date select → review → pay → confirmed).
3. **Unit 2.3:** Paystack sandbox integration + webhook handler at `/api/webhooks/paystack`.
4. **Unit 2.4:** Vendor bookings dashboard.
5. **Unit 2.5:** Customer dashboard skeleton.

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

- **DISPUTED booking SE-2026-0009 and REFUNDED SE-2026-0010 have no `Dispute` model rows.** The `Dispute` table row (with `reason`, `evidenceUrls`, `status`) is created in the booking flow (Unit 2.2) and managed in the admin dispute queue (Unit 3.x). The seed intentionally omits Dispute rows — the bookings are in the correct status and their Payment rows are correct (HELD-frozen and REFUNDED respectively). This is a known, documented gap, not missing data.
- Manual rename tasks still pending: (1) `EMAIL_FROM`
  in `.env.local` (update to `EventIQ <hello@eventiq.com>`),
  (2) Clerk dashboard app name (verify wordmark reads
  EventIQ in hosted Clerk UI).
- Clerk is on test keys — a production Clerk instance
  is required before real-user launch.
  - **REQUIRED SETUP (any new Clerk instance):** The session-token template
    (Dashboard → Sessions → Customize session token) must include
    `{ "metadata": "{{user.public_metadata}}" }`. This config is NOT in the
    repo — it lives only in the Clerk Dashboard. Without it,
    `sessionClaims.metadata` is always undefined and all JWT-role-based
    routing silently breaks (proxy onboarding gate, admin gate fast-path,
    page.tsx Tier 1 — all fall through). Root cause of BUG-014.
- Real domain (`eventiq.ng` or client choice) to be
  attached to Vercel when confirmed; current URL is
  `sphene-events.vercel.app` (cosmetic only).
- EventIQ namespace / trademark concern pending client
  confirmation — multiple existing event-software
  companies use the name.
- Font preload console warnings: harmless, defer cleanup.
- `lib/env.ts` startup env validation not yet created —
  add before Phase 1 ships.
- Admin verification queue: age column wording (e.g. "2 days ago") is
  clear but could be ambiguous for submissions near the 48 h SLA boundary.
  Minor display polish, deferred.

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
| 2026-06-03 | **AD-008: Two-layer admin gating (proxy + layout)** — Admin routes at `/admin(.*)` are protected by two independent checks. Layer 1: `proxy.ts` reads `sessionClaims.metadata.role` from the Clerk JWT at the edge and returns a bare 404 for any non-admin (not a redirect, not a 403 — hides admin URL existence per §12). Layer 2: `(admin)/layout.tsx` calls `getCurrentUser()` to re-check the DB `User.role === ADMIN` (invariant 10 — server-side re-check is mandatory). Admin role is only ever set manually in the Clerk dashboard, never programmatically, so the AD-004 staleness window does not apply; both checks are expected to agree. The two-layer pattern is defense in depth, not a staleness workaround. A forged or replayed session token that passes the proxy still fails the DB check in the layout. | Invariant 10 requires a DB re-check; proxy check alone is insufficient. Edge-native JWT check alone doesn't satisfy the source-of-truth requirement (invariant 8). |
| 2026-06-03 | **AD-009: Onboarding-route gate in proxy.ts** — Returning authenticated users who visit `/onboarding/role` with a role already in their Clerk JWT are redirected via `NextResponse.redirect()` in `proxy.ts` before the page renders. This is the correct location for this redirect because the proxy issues a real HTTP 3xx response on every request type (full page load AND client-side RSC fetch), whereas `redirect()` called from inside a Next.js Server Component during an RSC fetch produces an RSC-embedded redirect (HTTP 200) that can fail to deliver cleanly on first post-auth load. Users with no JWT role (genuine first-time users or stale-Clerk returning users) are let through to `page.tsx`, which checks the DB via `findCurrentUser()` as a fallback (invariant 8). The proxy gate is a UX fast-path optimization; it does NOT replace the DB-based authority check in page.tsx. | In-page Server Component redirects for returning-user guard logic are unreliable on first post-auth RSC fetch. Proxy redirects are authoritative at the HTTP level and work unconditionally. Note: this gate only functions if the Clerk session-token template includes `"metadata": "{{user.public_metadata}}"` — without it, `sessionClaims.metadata` is always undefined and the gate silently no-ops for all users (BUG-014). |
| 2026-06-05 | **AD-010: Vendor layout uses `findCurrentUser()`, not `getCurrentUser()`** — `(vendor)/layout.tsx` gates on `findCurrentUser()` (read-only DB lookup, no side effects) rather than `getCurrentUser()` (which calls `ensureUser()` and creates a DB row). The reason: `setUserRole("VENDOR")` redirects immediately to `/vendor/onboarding` after writing VENDOR to the DB, before the Clerk session JWT has had time to refresh (BUG-014 propagation lag, up to ~60s). If `getCurrentUser()` were used in the layout, it would call `ensureUser()` during this window, see no role in the JWT, find or create a row with role=CUSTOMER, and the gate would fail — re-introducing BUG-011. `findCurrentUser()` reads `User.role` directly from the DB (invariant 8 — DB is source of truth) and returns null without creation side effects. Contrast with AD-008 (admin layout): admin role is only ever set manually in the Clerk Dashboard well in advance of access, so the JWT is always fresh and `getCurrentUser()` is safe there. The vendor case is special because the role write and the protected-page visit happen in the same browser navigation chain. | DB is source of truth (invariant 8). Post-role-selection JWT lag makes JWT-based checks unreliable for the vendor case specifically. `findCurrentUser()` is always safe to use in layouts because it never creates rows. |
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
- 2026-06-02: Phase 1 Units 1.0 and 1.1 complete. Bug log and Cloudinary done.
- 2026-06-02: Phase 1 Unit 1.2 complete. /vendors browse page with filters, pagination, skeleton loading, empty state. First service-layer file established (src/services/vendor.ts). EmptyState shared component created. proxy.ts updated to cover /vendors(.*) as public routes (also covers Unit 1.3).
- 2026-06-02: Phase 1 Unit 1.3 complete. /vendors/[slug] detail page. getVendorBySlug() added to vendor service (returns null for unverified/suspended → notFound()). VerifiedBadge component (Verified Business vs Verified Individual based on cacNumber). PortfolioGallery client lightbox — one Dialog per image, fully uncontrolled (BUG-003). Hero with cover photo, rating, verified badge. About section with bio, experience, city, Instagram link. Services section with price and stub "Book this service" CTA → /book/[serviceId]. Empty reviews section with placeholder. loading.tsx shape-matched skeleton. generateMetadata for dynamic OG title/description. Note: lucide-react version installed does not export Instagram — replaced with ExternalLink for the Instagram handle link. npm run build passes clean.
- 2026-06-03: BUG-009 fixed. Root cause: ensureUser upsert used clerkId-only matching. When a Clerk user was deleted and re-created with the same email, the new clerkId caused a P2002 email unique constraint violation on create. Fixed by catching P2002 and reconciling: find existing row by email, update clerkId to new value, return row with role preserved. No schema change. Build passes clean. See docs/bug-log.md BUG-009.
- 2026-06-03: BUG-012 fixed. Root cause of blank /onboarding/role on first post-auth load: redirect() called from a Server Component during a client-side RSC fetch is delivered as an RSC-embedded redirect (HTTP 200), not a real HTTP redirect. Browser router sometimes fails to follow it on first post-auth load. Fix: moved the "user already has a role, skip onboarding" redirect into proxy.ts (AD-009). NextResponse.redirect() in proxy always issues a real HTTP 3xx, unconditionally. Page.tsx Tier 1 (JWT) and Tier 2 (DB/findCurrentUser) retained as defense-in-depth for the stale-JWT case. BUG-012 documented. Proxy responsibilities extended — see AD-009.
- 2026-06-03: Phase 1 Unit 1.4 complete. Admin shell + verification queue. Two-layer gating: proxy.ts reads Clerk publicMetadata.role at the edge (404 for non-admins), (admin)/layout.tsx re-checks DB role (defense in depth). Schema: VENDOR_INFO_REQUESTED added to AuditAction enum, migration applied (20260603080642_add_info_requested_audit), Prisma validate + generate done. Seed: 4th vendor (Bright Clicks Studio, PHOTOGRAPHY, PENDING) added to keep queue non-empty. Routes built: /admin (overview stats), /admin/verifications (queue with 48h SLA age coloring), /admin/verifications/[id] (full submission detail — business info, bank details, services, docs placeholder, portfolio). Server Actions: approveVendor/rejectVendor/requestInfoVendor — each has Zod validation, requireRole("ADMIN") re-check, atomic status+AuditLog transaction, visible email stub (console.log with TODO(Week3):Resend label). Action dialogs: uncontrolled Dialog (BUG-003), Textarea via useRef (no controlled state for open). Admin chrome uses --secondary (jade) accent, visually distinct from public site. Note: the seed admin user (user_seed_admin_001) has a fake Clerk ID. To access /admin in the app, the developer must set publicMetadata.role = "admin" on their real Clerk account via Clerk dashboard — the proxy checks JWT claims. npm run build passes clean.
- 2026-06-05: Phase 1 Unit 2.1 Slice A complete. Schema: added `primaryCategory VendorCategory?` to VendorProfile; migration `20260605194908_add_vendor_primary_category` applied to Neon. Seed: all 5 vendor profiles now have primaryCategory set. Admin queue: getPendingVendors() and getVendorSubmission() now read primaryCategory from DB first, fall back to services; detail page shows Category field in Business Information. setUserRole(): VENDOR branch now redirects to /vendor/onboarding (was /). proxy.ts: returning vendor with JWT role redirects to /vendor/onboarding instead of /. New route: (vendor)/layout.tsx gates on findCurrentUser() DB check — redirect('/') for non-VENDOR; (vendor)/vendor/onboarding/page.tsx is a themed stub. npm run build passes (9 routes). Prisma validate passes. Unit 2.1 NOT complete — Slice B (4-step form UI) is next. See AD-010.
- 2026-06-05: Phase 1 Unit 1.5 complete. Seed data expanded in 3 PRs (PART 1: vendor + bookings; PART 2: payments + reviews; PART 3: audit logs + webhooks). Final counts after re-seed: User 10, VendorProfile 5 (4 APPROVED + 1 PENDING), Service 10, PortfolioItem 15, Booking 11 (7 distinct statuses), Payment 8, Review 5, AuditLog 19, WebhookEvent 7. Requirement 3 fully satisfied. cleanup() extended to delete AuditLog and WebhookEvent rows before each run (no cascade from users/bookings). AuditAction imported. npm run build passes. Re-seed resets the admin role — developer must re-set publicMetadata.role = "admin" in Clerk dashboard after each seed run.
- 2026-06-04: TRUE resolution of the BUG-010/011/012 auth saga. After the BUG-012 proxy redirect was deployed it STILL failed — returning users landed on a blank /onboarding/role. Root cause was not code: the Clerk Dashboard session-token template was empty ({}), so publicMetadata.role was never embedded in the session JWT, making sessionClaims.metadata undefined for every user. Every JWT-role check — page.tsx Tier 1 and the BUG-012 proxy gate — fell through. Fixed by adding { "metadata": "{{user.public_metadata}}" } to the Clerk session-token template (Dashboard → Sessions → Customize session token). Verified clean on a fresh account: returning customer → homepage, no blank; new user → role page works; admin → /admin loads; signed-out and signed-in non-admin → both 404 on /admin. The BUG-009–012 code fixes were all necessary and correct but none could work until the JWT carried the role. See docs/bug-log.md BUG-014. Also: BUG-011 (Tier 2 getCurrentUser→ensureUser side-effect creating ambiguous CUSTOMER state; fixed with read-only findCurrentUser) and BUG-013 (seed: Bright Clicks Studio had no services, breaking approve-then-appear; added two active services) resolved in the same span.