# Environment Variables

Catalog of every environment variable used by the
project. Add new variables here before adding them
to code.

## Convention

- Public (browser-readable) vars are prefixed
  `NEXT_PUBLIC_`.
- All other vars are server-only.
- Secrets never appear in client components or
  client-bundled code.
- Local development uses `.env.local`. Never commit.
- Production secrets live in Vercel project settings.

## Required Variables

### Database

| Variable        | Example                                   | Where to get it                          |
| --------------- | ----------------------------------------- | ---------------------------------------- |
| `DATABASE_URL`  | `postgresql://user:pass@host/db?sslmode=require` | Neon dashboard → Connection Details. |
| `DIRECT_URL`    | `postgresql://user:pass@host/db?sslmode=require` | Neon dashboard → Direct (non-pooled). Used by Prisma migrate. |

### Clerk (Auth)

| Variable                                    | Example       | Where to get it                          |
| ------------------------------------------- | ------------- | ---------------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`         | `pk_test_...` | Clerk dashboard → API Keys.              |
| `CLERK_SECRET_KEY`                          | `sk_test_...` | Clerk dashboard → API Keys.              |
| `CLERK_WEBHOOK_SECRET`                      | `whsec_...`   | Clerk dashboard → Webhooks → Endpoint.   |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`             | `/sign-in`    | Constant.                                |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`             | `/sign-up`    | Constant.                                |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/onboarding/role` | Constant.                       |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/onboarding/role` | Constant.                       |

### Paystack (Payments)

| Variable                              | Example       | Where to get it                          |
| ------------------------------------- | ------------- | ---------------------------------------- |
| `PAYSTACK_SECRET_KEY`                 | `sk_test_...` | Paystack dashboard → Settings → API Keys. |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`     | `pk_test_...` | Paystack dashboard → Settings → API Keys. |
| `PAYSTACK_WEBHOOK_SECRET`             | (your choice) | Paystack uses your secret key for webhook signing. |

### Cloudinary (File Storage)

| Variable                              | Example         | Where to get it                          |
| ------------------------------------- | --------------- | ---------------------------------------- |
| `CLOUDINARY_CLOUD_NAME`               | `naijavendors`  | Cloudinary dashboard → Product Environment. |
| `CLOUDINARY_API_KEY`                  | `123456789...`  | Cloudinary dashboard → Account Details.  |
| `CLOUDINARY_API_SECRET`               | `Ab1Cd2...`     | Cloudinary dashboard → Account Details.  |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`   | `naijavendors`  | Same value as above, for client uploads. |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`| `nv_unsigned`   | Cloudinary dashboard → Settings → Upload presets. Create unsigned preset. |

### Resend (Email)

| Variable        | Example       | Where to get it                          |
| --------------- | ------------- | ---------------------------------------- |
| `RESEND_API_KEY` | `re_...`     | Resend dashboard → API Keys.             |
| `EMAIL_FROM`    | `NaijaVendors <hello@naijavendors.ng>` | Must be a verified Resend domain. |

### Cron Jobs

| Variable        | Example         | Where to get it                          |
| --------------- | --------------- | ---------------------------------------- |
| `CRON_SECRET`   | (long random)   | Generate with `openssl rand -base64 32`. Set in Vercel. |

### App Configuration

| Variable                  | Example                       | Where to get it                       |
| ------------------------- | ----------------------------- | ------------------------------------- |
| `NEXT_PUBLIC_APP_URL`     | `https://naijavendors.ng`     | Production URL.                       |
| `NEXT_PUBLIC_APP_NAME`    | `NaijaVendors`                | Brand name.                           |
| `ADMIN_EMAIL_ALLOWLIST`   | `you@email.com,team@email.com`| Comma-separated admin emails (for safety check). |

## Template `.env.example`

```env
# Database
DATABASE_URL=
DIRECT_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/onboarding/role
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/onboarding/role

# Paystack
PAYSTACK_SECRET_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=

# Resend
RESEND_API_KEY=
EMAIL_FROM=

# Cron
CRON_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=NaijaVendors
ADMIN_EMAIL_ALLOWLIST=
```

## Validation

A single Zod schema at `lib/env.ts` validates all
environment variables at startup. Missing or
malformed env causes the app to fail fast at boot
rather than at runtime.

```ts
// lib/env.ts pattern
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  CLERK_SECRET_KEY: z.string().min(1),
  PAYSTACK_SECRET_KEY: z.string().startsWith('sk_'),
  // ... etc
});

export const env = envSchema.parse(process.env);
```

Server modules import `env` from `lib/env.ts` instead
of touching `process.env` directly.

## Notes on Each Service

### Neon (PostgreSQL)

- Use the pooled URL for `DATABASE_URL`.
- Use the unpooled URL for `DIRECT_URL` (Prisma migrate
  needs it).
- Free tier is sufficient for MVP. Upgrade when
  approaching connection or storage limits.

### Clerk

- Use test mode keys during development.
- Switch to production keys before deploying live.
- Webhook endpoint: `https://<your-domain>/api/webhooks/clerk`.
- Subscribe to: `user.created`, `user.updated`,
  `user.deleted`.

### Paystack

- Use test keys for development. Test cards available
  in Paystack docs.
- Switch to live keys before launch (requires
  Paystack KYC verification of your business).
- Webhook endpoint: `https://<your-domain>/api/webhooks/paystack`.
- Webhook events: `charge.success`, `transfer.success`,
  `transfer.failed`, `refund.processed`.

### Cloudinary

- Use the free tier until usage requires upgrade.
- Create one unsigned upload preset for client-side
  uploads (portfolio, profile photos).
- Use signed uploads server-side for verification
  documents (more secure).

### Resend

- Verify your sending domain before launch.
- Use a test domain or `onboarding@resend.dev` for
  development.
