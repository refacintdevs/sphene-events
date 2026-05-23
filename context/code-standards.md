# Code Standards

## General

- Keep modules small and single-purpose. If a file
  exceeds 200 lines, consider splitting.
- Fix root causes, not symptoms. Do not layer
  workarounds on top of broken behavior.
- Do not mix unrelated concerns in one component,
  route, or service.
- Prefer composition over configuration. A component
  with 10 boolean props should be 2 components.
- Optimize for readability first, performance second.
  Measure before optimizing.
- No dead code. Delete unused imports, variables,
  files, and routes immediately.

## TypeScript

- Strict mode is required (`"strict": true` in
  `tsconfig.json`).
- Avoid `any`. Use `unknown` and narrow with type
  guards, or define an explicit interface.
- Avoid type assertions (`as Foo`). If you need one,
  the type system is telling you something is wrong.
  Exceptions: narrowing after a Zod parse, or
  Prisma's `JsonValue`.
- Validate all unknown external input at system
  boundaries with Zod before trusting it. This
  includes route handler bodies, search params,
  webhook payloads, and Clerk metadata.
- Use `type` for unions, intersections, and primitives.
  Use `interface` for object shapes that may be
  extended or implemented.
- Export types alongside the code that defines them.
  Do not centralize all types in a `types.ts` file.
- Co-locate Zod schemas with the route or service
  that uses them, except for shared domain schemas
  which live in `lib/validators/`.

## Next.js

- Default to Server Components. Add `"use client"`
  only when the component uses state, effects, refs,
  or browser-only APIs.
- Server Components fetch data directly. Do not call
  internal route handlers from Server Components.
- Use Server Actions for form submissions where
  possible. Route handlers are for webhooks, public
  APIs, and complex multi-step flows.
- Route handlers stay focused. One handler = one
  HTTP method = one responsibility. Compose by
  calling services, not by stuffing logic into
  the handler.
- Use the `(group)` folder convention for route
  groups. Layouts in route groups enforce role
  and load shared chrome (sidebar, nav).
- `loading.tsx` and `error.tsx` are required for
  every route group root.
- Metadata is defined per route via the `metadata`
  export. Do not skip page titles.
- Never use `<a>` for internal links. Use `<Link>`.

## React

- Components are PascalCase. Hooks are `useCamelCase`.
  Files match the export.
- Co-locate component tests, styles, and helpers in
  the same folder as the component when they exist.
- Lift state only when necessary. Component-local
  state is preferred.
- Server Component composition: pass data down, not
  hooks up. Pass plain serializable props from
  server to client components.
- No `useEffect` for data fetching. Use Server
  Components, Server Actions, or a typed fetcher.
- Forms use `react-hook-form` with Zod resolvers.
  All forms validate on the client AND the server.

## Styling

- Use Tailwind utility classes. No inline `style`
  attributes except for dynamic values (e.g. CSS
  variables driven by props).
- Use CSS custom property tokens defined in
  `ui-context.md`. No hardcoded hex values in
  components.
- Follow the border-radius scale defined in
  `ui-context.md`.
- Dark and light mode are both supported via the
  `next-themes` provider. Every color reference must
  work in both modes. Use semantic tokens
  (`bg-background`, `text-foreground`), not direct
  shades (`bg-zinc-900`).
- Mobile-first responsive design. Default styles
  are mobile; add `md:` and `lg:` for larger screens.
- Use `clsx` and `tailwind-merge` (via `cn()` helper)
  for conditional classes.

## API Routes

- Validate request input with Zod before any logic
  runs. Return 400 with a structured error on
  validation failure.
- Check authentication via Clerk before mutations.
  Return 401 if unauthenticated.
- Check ownership and role before mutations. Return
  403 if unauthorized.
- Return consistent response shapes:
  - Success: `{ data: T }`
  - Error: `{ error: { code: string; message: string;
    details?: unknown } }`
- HTTP status codes match the situation: 200 (OK),
  201 (Created), 400 (Bad Request), 401
  (Unauthenticated), 403 (Forbidden), 404 (Not Found),
  409 (Conflict), 422 (Unprocessable), 500 (Server
  Error). Do not default to 200 for errors.
- Webhooks verify signatures before processing.
  Paystack and Clerk webhooks both sign their
  payloads — verify before trusting.
- Idempotency: webhook handlers must be safe to
  retry. Use the event ID as a deduplication key.

## Data and Storage

- Metadata belongs in PostgreSQL. References to
  binary content belong in PostgreSQL. The binary
  content itself belongs in Cloudinary.
- Do not store large content (images, PDFs, base64
  blobs) directly in the database.
- All money is stored in kobo (₦1 = 100 kobo) as
  `Int`. Never store currency as `Float` or
  `Decimal` without explicit reason. Display
  formatting is presentation-layer only.
- Timestamps are stored as UTC `DateTime`. Display
  in user's local timezone (default Africa/Lagos)
  is presentation-layer only.
- Soft delete only when the business case demands
  it. Default to hard delete. If soft delete is
  used, add a `deletedAt` field and filter all
  queries.
- Every mutating service writes an entry to the
  `AuditLog` table for high-stakes actions
  (payment release, verification decision,
  account suspension).

## File Organization

- `app/` — Routes only. No business logic.
- `app/api/` — HTTP entry points. Thin handlers
  that call services.
- `components/ui/` — shadcn/ui primitives. Do not
  hand-edit.
- `components/` — Feature components. Subfolders
  by domain (`booking/`, `vendor/`, `admin/`).
- `lib/` — Framework-agnostic utilities and
  external clients. No React imports.
- `services/` — Domain logic. Pure functions that
  take inputs and return outputs. The only place
  that orchestrates Prisma + external APIs.
- `prisma/` — Schema, migrations, seed data.
- `context/` — Project documentation. Source of
  truth for AI workflow.
- `hooks/` — Custom React hooks. Client-only.
- `types/` — Shared types only when they cannot
  be co-located.

## Naming

- Files: `kebab-case.ts` for utilities,
  `PascalCase.tsx` for components.
- Variables and functions: `camelCase`.
- Types and interfaces: `PascalCase`.
- Constants: `SCREAMING_SNAKE_CASE` only for true
  module-level constants. `camelCase` for everything
  else.
- Boolean variables: `is`, `has`, `should`, `can`
  prefixes (`isVerified`, `hasBookings`).
- Database table names: `PascalCase` singular
  (`User`, `Booking`).
- Database column names: `camelCase`.

## Git and Commits

- Conventional commits: `feat:`, `fix:`, `chore:`,
  `refactor:`, `docs:`, `test:`.
- One concern per commit. If the commit message
  needs "and", split it.
- Never commit `.env*`, `node_modules/`,
  `.next/`, or Prisma generated client.

## Error Handling

- Throw errors from services. Catch them at the
  route handler boundary and translate to HTTP
  responses.
- Use custom error classes for known conditions
  (`UnauthorizedError`, `NotFoundError`,
  `ValidationError`, `PaymentError`).
- Never swallow errors silently. If you catch,
  either handle or rethrow.
- User-facing error messages must be safe to show.
  Internal error details (stack traces, SQL,
  third-party API responses) go to logs, not
  the client.

## Performance

- Use Prisma `select` and `include` deliberately.
  Never fetch full records when you need three fields.
- Paginate any list that can grow. Default page
  size 20, max 100.
- Index foreign keys and any column used in `WHERE`
  or `ORDER BY` at scale.
- Use `next/image` for all images. Never use
  `<img>`. Cloudinary URLs work directly with
  `next/image`.
- Lazy-load heavy client components with
  `next/dynamic` when they are below the fold or
  conditional.
