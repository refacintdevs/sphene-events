# Progress Tracker

Update this file after every meaningful implementation
change. Treat it as a running journal of where the
project is and how it got there.

## Current Phase

- Phase 0 — Foundation. Project initialization, stack
  setup, and base configuration.

## Current Goal

- Initialize the Next.js project with the full
  documented stack and verify the build pipeline
  works end to end.

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

## In Progress

- None. Phase 0 Unit 1 complete.

## Next Up

The next implementation units, in order:

1. **shadcn/ui init**: Run shadcn init, install MVP
   components listed in `ui-context.md`. Verify a
   sample button renders in both modes.
2. **Prisma + Database**: Set up Prisma with Neon
   PostgreSQL. Run initial migration with the schema
   from `database-schema.md`. Verify Prisma Studio
   connects.
3. **Clerk auth**: Install Clerk, set up middleware,
   create sign-in/sign-up pages. Verify a user can
   sign up and `userId` flows to the server.
4. **Role selection flow**: After sign-up, prompt for
   role (customer or vendor). Write to Clerk metadata
   and create a `User` row.
5. **Route groups and layouts**: Create `(public)`,
   `(customer)`, `(vendor)`, `(admin)` groups with
   role-gated middleware.
6. **Landing page**: Build the home page with hero,
   featured categories, and trust signals.

## Open Questions

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
- Domain name and brand: "Sphene Events" is the confirmed
  name. Finalize domain before public launch
  preparation.

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
