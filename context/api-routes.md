# API Routes

Catalog of every API route in the application. Claude
Code consults this before creating new routes to avoid
duplication or invented endpoints.

## Conventions

- All routes live under `app/api/`.
- Route handlers are thin: parse, auth, delegate to
  service, format response.
- Request bodies are validated with Zod schemas before
  any logic runs.
- Auth is checked via `auth()` from `@clerk/nextjs/server`.
- Role/ownership is checked before mutations.
- Response shape:
  - Success: `{ data: T }`
  - Error: `{ error: { code: string; message: string;
    details?: unknown } }`

## Route Index

### Authentication and Onboarding

| Method | Path                          | Auth     | Purpose                                              |
| ------ | ----------------------------- | -------- | ---------------------------------------------------- |
| POST   | `/api/onboarding/role`        | Required | Set user role (CUSTOMER or VENDOR), create User row. |

### Vendor Profile

| Method | Path                              | Auth         | Purpose                                            |
| ------ | --------------------------------- | ------------ | -------------------------------------------------- |
| POST   | `/api/vendor/profile`             | Vendor       | Create vendor profile (during onboarding).         |
| PATCH  | `/api/vendor/profile`             | Vendor (own) | Update vendor profile fields.                      |
| POST   | `/api/vendor/profile/submit`     | Vendor (own) | Submit profile for verification.                   |
| GET    | `/api/vendor/profile/me`          | Vendor       | Get current vendor's profile.                      |

### Vendor Documents and Portfolio

| Method | Path                                       | Auth         | Purpose                                            |
| ------ | ------------------------------------------ | ------------ | -------------------------------------------------- |
| POST   | `/api/vendor/documents`                    | Vendor (own) | Upload verification document (Cloudinary signed). |
| DELETE | `/api/vendor/documents/[id]`               | Vendor (own) | Delete a verification document.                    |
| POST   | `/api/vendor/portfolio`                    | Vendor (own) | Add portfolio item.                                |
| PATCH  | `/api/vendor/portfolio/[id]`               | Vendor (own) | Update portfolio item (caption, order).            |
| DELETE | `/api/vendor/portfolio/[id]`               | Vendor (own) | Delete portfolio item.                             |
| POST   | `/api/vendor/portfolio/reorder`            | Vendor (own) | Bulk update display order.                         |
| POST   | `/api/uploads/signature`                   | Any auth     | Get signed Cloudinary upload params.               |

### Services

| Method | Path                          | Auth         | Purpose                                            |
| ------ | ----------------------------- | ------------ | -------------------------------------------------- |
| POST   | `/api/vendor/services`        | Vendor (own) | Create a service.                                  |
| PATCH  | `/api/vendor/services/[id]`   | Vendor (own) | Update a service.                                  |
| DELETE | `/api/vendor/services/[id]`   | Vendor (own) | Delete a service (only if no active bookings).    |

### Public Vendor Discovery

| Method | Path                                  | Auth   | Purpose                                            |
| ------ | ------------------------------------- | ------ | -------------------------------------------------- |
| GET    | `/api/vendors`                        | Public | Search and filter vendors. Query params: category, city, minPrice, maxPrice, date, sort, page. |
| GET    | `/api/vendors/[slug]`                 | Public | Get public vendor profile by slug.                 |
| GET    | `/api/vendors/[slug]/services`        | Public | List active services for a vendor.                 |
| GET    | `/api/vendors/[slug]/portfolio`       | Public | List portfolio items for a vendor.                 |
| GET    | `/api/vendors/[slug]/reviews`         | Public | List public reviews. Query: page.                  |

### Bookings (Customer)

| Method | Path                                        | Auth                  | Purpose                                            |
| ------ | ------------------------------------------- | --------------------- | -------------------------------------------------- |
| POST   | `/api/bookings`                             | Customer              | Create a booking (status PENDING_VENDOR).         |
| GET    | `/api/bookings`                             | Customer              | List own bookings. Query: status, page.            |
| GET    | `/api/bookings/[bookingCode]`               | Customer or vendor (party) | Get booking detail (only if user is party).  |
| POST   | `/api/bookings/[bookingCode]/cancel`        | Customer (own)        | Cancel a booking (only if PENDING_VENDOR/ACCEPTED). |
| POST   | `/api/bookings/[bookingCode]/confirm`       | Customer (own)        | Confirm event completion. Booking → COMPLETED.    |
| POST   | `/api/bookings/[bookingCode]/review`        | Customer (own)        | Leave a review on a completed booking.            |

### Bookings (Vendor)

| Method | Path                                        | Auth          | Purpose                                            |
| ------ | ------------------------------------------- | ------------- | -------------------------------------------------- |
| GET    | `/api/vendor/bookings`                      | Vendor        | List bookings for own vendor profile. Query: status. |
| POST   | `/api/vendor/bookings/[bookingCode]/accept` | Vendor (own)  | Accept a pending booking.                          |
| POST   | `/api/vendor/bookings/[bookingCode]/decline`| Vendor (own)  | Decline a pending booking.                         |

### Payments

| Method | Path                                          | Auth     | Purpose                                            |
| ------ | --------------------------------------------- | -------- | -------------------------------------------------- |
| POST   | `/api/payments/initialize`                    | Customer | Start Paystack transaction for a booking.         |
| GET    | `/api/payments/callback`                      | Customer | Paystack post-payment redirect handler.            |
| POST   | `/api/payments/[bookingCode]/refund-request` | Customer (own) | Open a refund request (creates dispute).      |

### Disputes

| Method | Path                                        | Auth                  | Purpose                                            |
| ------ | ------------------------------------------- | --------------------- | -------------------------------------------------- |
| POST   | `/api/disputes`                             | Customer or vendor (party) | Open a dispute on a PAID booking.            |
| GET    | `/api/disputes/[id]`                        | Party or admin        | Get dispute detail.                                |

### Admin

| Method | Path                                              | Auth   | Purpose                                            |
| ------ | ------------------------------------------------- | ------ | -------------------------------------------------- |
| GET    | `/api/admin/verifications`                        | Admin  | List pending verifications. Query: status.         |
| POST   | `/api/admin/verifications/[vendorId]/approve`     | Admin  | Approve a vendor.                                  |
| POST   | `/api/admin/verifications/[vendorId]/reject`      | Admin  | Reject a vendor. Body: reason.                     |
| POST   | `/api/admin/verifications/[vendorId]/request-info`| Admin  | Request more info. Body: message.                  |
| GET    | `/api/admin/users`                                | Admin  | Search users. Query: q, role, page.                |
| POST   | `/api/admin/users/[userId]/suspend`                | Admin  | Suspend a user. Body: reason.                      |
| POST   | `/api/admin/users/[userId]/restore`                | Admin  | Restore a suspended user.                          |
| GET    | `/api/admin/disputes`                              | Admin  | List disputes. Query: status.                      |
| POST   | `/api/admin/disputes/[id]/resolve`                 | Admin  | Resolve a dispute. Body: outcome, message.         |
| GET    | `/api/admin/payouts`                               | Admin  | List bookings awaiting payout.                     |
| POST   | `/api/admin/payouts/[bookingCode]/release`         | Admin  | Trigger Paystack transfer to vendor.               |
| GET    | `/api/admin/audit-log`                             | Admin  | Read audit log. Query: action, subjectType, page.  |

### Webhooks

| Method | Path                          | Auth          | Purpose                                            |
| ------ | ----------------------------- | ------------- | -------------------------------------------------- |
| POST   | `/api/webhooks/paystack`      | Signed (HMAC) | Paystack event webhook. Verify signature first.    |
| POST   | `/api/webhooks/clerk`         | Signed (Svix) | Clerk user lifecycle webhook (user.created, etc.). |

### Scheduled Jobs

These are triggered by Vercel Cron, not user requests.
They live under `/api/cron/*` and check a secret token.

| Method | Path                                  | Auth         | Purpose                                            |
| ------ | ------------------------------------- | ------------ | -------------------------------------------------- |
| GET    | `/api/cron/expire-pending-bookings`   | Cron secret  | Mark PENDING_VENDOR bookings older than 48h as EXPIRED. |
| GET    | `/api/cron/send-event-reminders`      | Cron secret  | Send 3-day-before-event reminder emails.           |

## Standard Error Codes

Use these in error responses:

| Code                  | HTTP | Meaning                                            |
| --------------------- | ---- | -------------------------------------------------- |
| `UNAUTHORIZED`        | 401  | No valid session.                                  |
| `FORBIDDEN`           | 403  | Session valid, but not authorized for this action. |
| `NOT_FOUND`           | 404  | Resource does not exist.                           |
| `VALIDATION_ERROR`    | 400  | Input failed Zod validation.                       |
| `CONFLICT`            | 409  | State conflict (e.g. duplicate review).            |
| `RATE_LIMITED`        | 429  | Too many requests.                                 |
| `PAYMENT_FAILED`      | 402  | Paystack returned a failure.                       |
| `INVALID_STATE`       | 422  | Action invalid for current resource state.         |
| `INTERNAL_ERROR`      | 500  | Unexpected server error.                           |

## Patterns

### Pagination

All list endpoints accept `?page=N&perPage=M` with
defaults `page=1`, `perPage=20`, max `perPage=100`.

Response shape:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "totalPages": 5,
    "totalItems": 87
  }
}
```

### Search Query

Endpoints that accept text search use `?q=...`.

### Date Filters

Use ISO 8601 in URL params: `?date=2026-03-15`.

### Auth Helper

Every protected route starts with:

```ts
const { userId } = await auth();
if (!userId) return unauthorizedResponse();
```

For role-gated routes:

```ts
const user = await requireRole('VENDOR');
```

The `requireRole` helper throws a known error class
that translates to a 401/403 at the handler boundary.
