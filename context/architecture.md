# Architecture Context

## Stack

| Layer        | Technology                  | Role                                                |
| ------------ | --------------------------- | --------------------------------------------------- |
| Framework    | Next.js 16 (App Router) + TypeScript | Server-rendered React with file-based routing  |
| UI           | Tailwind CSS v4 + shadcn/ui | Utility-first styling with composable primitives    |
| Auth         | Clerk                       | User identity, sessions, role metadata, proxy (`proxy.ts`) |
| Database     | Prisma 7.8.0 + PostgreSQL (Neon) | Relational store for all platform data. Requires `@prisma/adapter-neon`. |
| DB Driver    | `@prisma/adapter-neon` + `@neondatabase/serverless` | WebSocket transport (PrismaNeon); supports transactions. Node.js ≥ 22 required for native WebSocket. |
| File Storage | Cloudinary                  | Portfolio images, vendor documents                  |
| Payments     | Paystack                    | Deposits, escrow holds, vendor payouts              |
| Email        | Resend                      | Transactional notifications                         |
| Hosting      | Vercel                      | App deployment, serverless functions                |
| Validation   | Zod                         | Runtime input validation at system boundaries       |

## System Boundaries

- `app/` — Next.js App Router. Route groups separate
  audiences: `(public)`, `(customer)`, `(vendor)`,
  `(admin)`. Each group has its own layout. Route
  handlers in `app/api/` own HTTP entry points only.
- `components/ui/` — shadcn/ui primitives. Generated
  via CLI. Do not modify by hand.
- `components/` — Application components composed
  from primitives. Organized by feature
  (`components/booking/`, `components/vendor/`).
- `lib/` — Shared utilities, clients, and pure helpers.
  No React. No route logic.
  - `lib/db.ts` — Prisma client singleton.
  - `lib/auth.ts` — Clerk helpers and role checks.
  - `lib/paystack.ts` — Paystack API client.
  - `lib/cloudinary.ts` — Cloudinary upload helpers.
  - `lib/email.ts` — Resend client and templates.
  - `lib/validators/` — Zod schemas grouped by domain.
- `services/` — Domain logic that orchestrates database,
  payments, and external calls. Routes call services,
  not Prisma directly.
- `prisma/` — Schema, migrations, seed scripts. Owns
  the data model.
- `context/` — Project documentation files. This
  folder. AI workflow source of truth.
- `public/` — Static assets only. No source code.

## Storage Model

- **PostgreSQL (Prisma)**: All metadata — users, vendor
  profiles, services, bookings, payments, reviews,
  verification records, dispute records, audit logs.
  References to external file URLs (Cloudinary IDs)
  live here. Connection URL routing: `DATABASE_URL`
  (pooled via PgBouncer) is used at runtime by `lib/db.ts`.
  `DIRECT_URL` (direct TCP) is used for migrations and
  `prisma studio` via `prisma.config.ts`.
- **Cloudinary**: All binary content — vendor portfolio
  images, verification documents (CAC certificates,
  ID photos), profile avatars. The database stores
  the Cloudinary public ID and URL only.
- **Clerk**: User identity, email, phone, password,
  session tokens, and a `publicMetadata.role` field
  (`customer` | `vendor` | `admin`). All other user
  data lives in our database, joined by Clerk's
  `userId`.

## Auth and Access Model

- Every authenticated user signs in via Clerk. Sign-in
  options: email + password, Google OAuth.
- On first sign-up, the user picks a role: customer or
  vendor. The role is written to Clerk's
  `publicMetadata.role` and a corresponding row is
  created in our `User` table.
- Admin role is assigned manually via Clerk dashboard —
  never through the app UI.
- Clerk proxy (`proxy.ts`) protects all routes outside
  the `(public)` group. Route group layouts enforce
  role at the page level.
- Ownership rules:
  - A vendor owns their `VendorProfile`, `Service`
    records, and `PortfolioItem` records.
  - A customer owns their `Booking` records (as the
    buyer); a vendor co-owns the same `Booking`
    record (as the seller).
  - Only admins can mutate verification state.
  - Only the buyer or admin can trigger a dispute
    or refund.
  - Only the platform can mutate escrow state.

## Invariants

1. **Route handlers do not run long work.** Any task
   over 5 seconds (image processing, bulk operations,
   external API chains) must move to a background
   job or a separate request flow.
2. **Money is never trusted from the client.** All
   booking amounts are computed server-side from
   the referenced `Service.price`. The client never
   posts a price.
3. **Verification state is admin-only.** No route
   handler outside `app/api/admin/` may mutate
   `VendorProfile.verificationStatus`.
4. **Escrow is single-source.** Booking payment state
   transitions only through `services/payment.ts`.
   No other module reads or writes `Payment.status`
   directly.
5. **Input is validated at the boundary.** Every
   route handler and server action validates input
   with a Zod schema before any logic runs. Unknown
   input is rejected with a 400 response.
6. **Auth is checked before logic.** Every mutating
   route handler calls the auth helper and ownership
   check before any database write.
7. **No hardcoded secrets.** All credentials, API
   keys, and connection strings live in environment
   variables. The repo never contains a real key.
8. **The database is the source of truth for state.**
   Booking status, verification status, and payment
   status live in the database. Client state mirrors
   the database, never the reverse.
9. **Prisma is accessed only through services.** Route
   handlers and server components never import the
   Prisma client directly except through helpers in
   `lib/db.ts` or functions in `services/`.
10. **No client-side role checks for security.** UI may
    hide options based on role, but every server
    handler re-checks role and ownership. Client
    checks are UX, not security.
