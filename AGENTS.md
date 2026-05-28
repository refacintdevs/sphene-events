<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# EventIQ — Agent Instructions

You are working on **EventIQ**, a web-based event vendor booking and marketplace platform for the Nigerian market. The project follows a strict spec-driven workflow defined in the `context/` folder.

## Read These Files Before Any Implementation

Read the following files in order. Do not skip. Do not skim.

### Always read first (every session)

1. `context/README.md` — index of all context files and how to use them
2. `context/ai-workflow-rules.md` — workflow constraints, scoping rules, definition of done
3. `context/progress-tracker.md` — current phase, completed work, what's next, open questions

### Always read before implementing

4. `context/project-overview.md` — product scope, phased features, success criteria
5. `context/architecture.md` — stack, system boundaries, storage model, invariants
6. `context/code-standards.md` — TypeScript, Next.js, React, styling, and naming rules
7. `context/ui-context.md` — theme tokens, typography, layout patterns, motion

### Read when relevant to the task

8. `context/feature-specs.md` — detailed behavior per feature (booking flow, verification, etc.)
9. `context/database-schema.md` — Prisma models, enums, relationships, indexes
10. `context/api-routes.md` — every API route, inputs, outputs, auth requirements
11. `context/env-variables.md` — every environment variable, where to get it, validation
12. `context/nigerian-context.md` — currency, phone formats, CAC, banks, local conventions

## Non-Negotiable Rules

- **Do not invent product behavior** that is not defined in the context files. If a requirement is ambiguous, stop and ask. If a requirement is missing, add it as an open question in `progress-tracker.md` and ask the user before proceeding.
- **Do not exceed the current phase's scope.** Phase 1 features are listed in `project-overview.md`. Phase 2 features are explicitly out of scope until Phase 1 is shipped and validated.
- **Do not assume Nigerian conventions.** Consult `nigerian-context.md` for currency, phone numbers, addresses, business registration, and cultural norms. If something is not documented, ask.
- **Do not assume libraries** beyond the stack in `architecture.md`. If a new dependency is needed, propose it and wait for approval before installing.
- **Do not modify protected files** listed in `ai-workflow-rules.md` without explicit instruction. This includes `components/ui/*`, Prisma migrations, lockfiles, and config files.
- **Always validate input at boundaries** with Zod. Every route handler and server action. No exceptions.
- **Always check auth and ownership** before mutations. Client-side role checks are UX, not security.
- **Money is stored in kobo as `Int`.** Never as `Float`. ₦1 = 100 kobo. See `nigerian-context.md`.

## Workflow

1. Before starting a unit of work, summarize the scope and confirm with the user.
2. Implement one vertical slice at a time. If a change touches multiple system boundaries, split it.
3. After completing a unit:
   - Verify `npm run build` passes with zero errors and zero warnings.
   - Update `context/progress-tracker.md` to reflect completed work.
   - Update any other context file whose behavior changed.
4. Surface decisions that are not specified. Do not make them silently.
5. When uncertain, say so. Do not guess and frame it as certainty.

## Definition of Done

A unit is not complete until all of the following are true:

1. The unit works end to end within its defined scope (manually verified).
2. No invariant in `architecture.md` is violated.
3. No rule in `code-standards.md` is violated.
4. The UI works in both light and dark modes and on mobile (375px) and desktop.
5. All inputs are validated with Zod at boundaries.
6. All mutating routes check auth and ownership.
7. `progress-tracker.md` is updated.
8. `npm run build` passes.
9. `npx prisma validate` passes (if schema changed).
10. New env vars (if any) are documented in `env-variables.md`.

## Communication

- Use plain language. Surface trade-offs honestly.
- Paste actual error messages and file paths, not paraphrases.
- If you skip a rule or take a shortcut, say so explicitly.
- Do not use celebratory language for routine work.