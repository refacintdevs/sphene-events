# Context Files — Sphene Events

This folder is the source of truth for the Sphene Events
project. Every implementation decision references one
of these files. When in doubt, the docs win.

## How to Use This Folder

When working with Claude Code, include the relevant
context files in your prompts. For most tasks, the
following pattern works well:

```
@context/ai-workflow-rules.md
@context/architecture.md
@context/code-standards.md
@context/progress-tracker.md
@context/<feature-relevant-file>.md
```

Then describe the unit of work you want done.

## File Index

| File                       | Purpose                                                                 | Read When                                              |
| -------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------ |
| `project-overview.md`      | What we're building, who it's for, phased scope.                        | Starting any new feature; questioning scope.           |
| `architecture.md`          | Stack, system boundaries, storage model, invariants.                    | Touching any new layer; making structural decisions.   |
| `code-standards.md`        | TypeScript, Next.js, React, styling, and naming rules.                  | Every implementation. Always.                          |
| `ui-context.md`            | Theme, colors, typography, layout patterns, motion.                     | Building any UI component or page.                     |
| `database-schema.md`       | Prisma models, enums, relationships, indexes.                           | Touching the database; designing a new model.          |
| `feature-specs.md`         | Detailed behavior per feature (booking flow, verification, etc.).       | Implementing any feature.                              |
| `api-routes.md`            | Every API route, its inputs, outputs, auth requirements.                | Adding or changing a route.                            |
| `env-variables.md`         | Every environment variable, where to get it, what it's for.             | Setting up; adding new integrations.                   |
| `nigerian-context.md`      | Currency, phone formats, CAC, banks, cultural conventions.              | Anything involving local data, payments, or copy.      |
| `ai-workflow-rules.md`     | How to work: scoping, splitting, doc syncing, definition of done.       | Every session, by Claude Code itself.                  |
| `progress-tracker.md`      | Where we are, what's next, decisions made.                              | Resuming work; planning next unit.                     |

## Update Cadence

- `progress-tracker.md` — update after every unit
  of work.
- `feature-specs.md`, `database-schema.md`,
  `api-routes.md` — update when implementing or
  changing the relevant feature.
- `architecture.md`, `code-standards.md`,
  `ui-context.md` — update when a convention shifts
  (rare).
- `project-overview.md` — update when scope changes.
- `env-variables.md` — update when new env vars are
  introduced.
- `nigerian-context.md` — update when new local
  conventions are documented.
- `ai-workflow-rules.md` — rarely updated. The
  workflow rules should remain stable.

## Quick Start for Claude Code

When asked to start any new unit of work, follow
this order:

1. Read `ai-workflow-rules.md` to understand the
   workflow constraints.
2. Read `progress-tracker.md` to understand where
   the project is.
3. Read the feature-relevant context files
   (`feature-specs.md`, `database-schema.md`,
   `api-routes.md`, etc.).
4. Confirm scope with the user before writing code.
5. Implement the unit.
6. Update `progress-tracker.md` and any other
   affected docs.
7. Run `npm run build` to verify.

## Project Name

Working name: **Sphene Events**. May change before
launch. If renamed, update:

- `project-overview.md` (title and references)
- `env-variables.md` (`NEXT_PUBLIC_APP_NAME`)
- `package.json`
- `README.md` (root, not this file)
- Any user-facing copy

