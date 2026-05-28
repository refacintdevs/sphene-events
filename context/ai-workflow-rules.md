# AI Workflow Rules

## Approach

Build EventIQ incrementally using a spec-driven
workflow. The files in this `context/` folder define
what to build (`project-overview.md`, `feature-specs.md`),
how to build it (`architecture.md`, `code-standards.md`,
`ui-context.md`), what conventions exist
(`database-schema.md`, `api-routes.md`,
`nigerian-context.md`), and the current state of
progress (`progress-tracker.md`).

Always implement against these specs. Do not infer,
invent, or improvise behavior. If a spec is missing
or ambiguous, stop and resolve it in the relevant
context file before writing code.

The goal is shippable, verifiable increments — not
speculative architecture, not over-engineered
abstractions, not features that exceed the current
phase's scope.

## Scoping Rules

- Work on one feature unit at a time. A unit is a
  vertical slice that can be tested end to end.
- Prefer small, verifiable increments over large
  speculative changes.
- Do not combine unrelated system boundaries in a
  single implementation step.
- Confirm scope with the user before starting any
  unit that takes more than 30 minutes of work.
- Do not refactor unrelated code while implementing
  a feature. Note it in `progress-tracker.md` and
  do it separately.

## When to Split Work

Split an implementation step if it combines any of
the following:

- A UI change and a schema or migration change.
- A new database model and a new external integration
  (Paystack, Cloudinary, Clerk).
- Multiple unrelated API routes or services.
- A feature spec that contains undefined behavior —
  resolve the spec first, then implement.
- Public-facing UI and admin-facing UI in the same step.
- Customer flow and vendor flow in the same step.

If a change cannot be verified end to end in under
ten minutes of manual testing, the scope is too
broad — split it.

## Handling Missing Requirements

- Do not invent product behavior not defined in
  the context files.
- If a requirement is ambiguous, stop. Ask the user
  or document the resolution in the relevant context
  file before implementing.
- If a requirement is missing, add it as an open
  question in `progress-tracker.md` under
  "Open Questions" before continuing.
- Do not assume Nigerian conventions, payment flows,
  or domain rules. Consult `nigerian-context.md`.
  If not there, ask.
- Do not assume libraries or tools beyond the stack
  in `architecture.md`. If a new dependency is needed,
  propose it before installing.

## Protected Files

Do not modify the following without explicit
instruction:

- `components/ui/*` — generated shadcn/ui components.
  Regenerate via CLI if changes are needed.
- `prisma/migrations/*` — generated migration files.
  Never hand-edit. Create new migrations instead.
- `.env*` — environment files. Suggest changes in
  `env-variables.md` and let the user apply them.
- `package-lock.json` / `pnpm-lock.yaml` — lockfiles.
  Only changed by package manager commands.
- `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`,
  `postcss.config.mjs` — configuration files. Propose
  changes before making them.
- Files inside `node_modules/` or `.next/`. Ever.

## Keeping Docs in Sync

Update the relevant context file whenever
implementation changes the documented behavior:

- New table or field → update `database-schema.md`.
- New route → update `api-routes.md`.
- New environment variable → update `env-variables.md`.
- Stack change → update `architecture.md`.
- New convention or rule → update `code-standards.md`.
- New design token or component pattern → update
  `ui-context.md`.
- New feature behavior or scope change → update
  `project-overview.md` and `feature-specs.md`.
- Always update `progress-tracker.md` after every
  meaningful change.

Treat context files as the source of truth. If code
and docs disagree, the docs are wrong, the code is
wrong, or both — never leave it ambiguous.

## Before Moving to the Next Unit

A unit is not complete until all of the following
are true:

1. The current unit works end to end within its
   defined scope. Manually verified.
2. No invariant defined in `architecture.md` was
   violated.
3. No rule in `code-standards.md` was violated.
4. The UI matches the conventions in `ui-context.md`
   (works in both light and dark modes, uses
   semantic tokens, no hardcoded colors).
5. All inputs are validated with Zod at boundaries.
6. All mutating routes check auth and ownership.
7. `progress-tracker.md` is updated to reflect
   completed work.
8. `npm run build` passes with zero TypeScript
   errors and zero ESLint warnings.
9. `npx prisma validate` passes if the schema changed.
10. New environment variables, if any, are documented
    in `env-variables.md`.

If any of these is false, the unit is not done.
Do not proceed.

## Communication with the User

- Before starting a unit, summarize what will be
  built and confirm.
- During implementation, surface decisions that are
  not specified in context files. Do not make them
  silently.
- After completing a unit, summarize what changed,
  what files were touched, and what to test.
- When errors occur, share the actual error message
  and the file/line, not a paraphrase.
- When uncertain, say so. Do not guess and frame it
  as certainty.

## What "Done" Looks Like

A feature is done when:

- A non-technical person can complete the user flow
  end to end without help.
- The flow works in both light and dark modes.
- The flow works on mobile (375px width) and desktop.
- Errors are handled gracefully with user-readable
  messages.
- Empty states exist for every list view.
- Loading states exist for every async operation.
- The relevant context files reflect the implementation.
