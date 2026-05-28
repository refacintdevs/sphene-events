# Feature Specifications

This file defines *how* each feature behaves. Where
`project-overview.md` describes *what* exists,
this file is the implementation contract. When Claude
Code implements a feature, it implements against this
spec — not against intuition.

## 1. Authentication and Role Selection

### Behavior

1. User visits `/sign-up` or `/sign-in`. Clerk hosted
   pages handle the flow.
2. After successful sign-up, user is redirected to
   `/onboarding/role`.
3. Role selection page presents two cards:
   "I want to book vendors" (CUSTOMER) and
   "I am a vendor" (VENDOR).
4. On selection, the app:
   - Updates Clerk `publicMetadata.role`.
   - Creates a `User` row in the database with the
     selected role.
   - Redirects CUSTOMER to `/dashboard`.
   - Redirects VENDOR to `/vendor/onboarding`.
5. Returning users who already have a role bypass
   `/onboarding/role` and go to their dashboard.

### Rules

- Role cannot be changed by the user after selection.
  Changing roles requires admin intervention.
- Admin role is never selectable in the UI. It is
  set manually via Clerk dashboard.
- If a user signs in but no `User` row exists in our
  DB (data drift), the proxy (`proxy.ts`) triggers
  lazy sync via `getCurrentUser()` to recreate the row.

## 2. Vendor Onboarding and Verification

### Behavior

1. Newly signed-up vendors land on `/vendor/onboarding`.
2. Onboarding is a 4-step form:
   - **Step 1 — Business Basics**: business name,
     bio (200-1000 chars), years of experience,
     primary category.
   - **Step 2 — Location and Contact**: address,
     state (Lagos only in MVP), WhatsApp number
     (validated +234 format), Instagram handle
     (optional).
   - **Step 3 — Verification Documents**: upload
     CAC certificate (required), government ID
     (required), 3-5 portfolio samples (required).
   - **Step 4 — Bank Details**: bank name, account
     number, account name. Used for payouts.
3. On submit, `VendorProfile.verificationStatus` is
   set to `PENDING`. Vendor is shown a "Under Review"
   status page.
4. Vendor cannot create services or appear in search
   until `verificationStatus = APPROVED`.

### Admin Verification

1. Admin sees pending submissions on
   `/admin/verifications`.
2. Admin opens a submission and sees all data:
   business info, documents (clickable to view in
   Cloudinary), portfolio samples.
3. Admin can:
   - **Approve**: sets status to `APPROVED`,
     `verifiedAt` to now. Sends approval email.
   - **Reject**: sets status to `REJECTED`, requires
     a reason (stored in `verificationNotes`). Sends
     rejection email with reason.
   - **Request Info**: sets status to `INFO_REQUESTED`,
     requires a message. Vendor sees the message and
     can update documents.
4. Every action is logged in `AuditLog`.

### Rules

- Verification SLA is 72 hours. Admin dashboard
  highlights submissions older than 48 hours.
- A rejected vendor can resubmit after updating
  their information. Resubmitting resets status
  to `PENDING`.
- CAC number is optional but increases trust.
  Vendors without CAC get a "Verified Individual"
  badge; vendors with CAC get a "Verified Business"
  badge.

## 3. Service Management

### Behavior

1. Verified vendors visit `/vendor/services`.
2. They see a list of their services with edit and
   delete actions.
3. "Add Service" opens a form:
   - Category (must match vendor's allowed categories).
   - Title (5-100 chars).
   - Description (50-1000 chars).
   - Price in naira (converted to kobo on submit).
   - Duration hours (optional).
   - Serves up to X people (caterers only).
4. On save, a `Service` row is created with
   `isActive = true`.
5. Vendor can toggle `isActive` to hide a service
   without deleting it.

### Rules

- Price minimum: ₦5,000. Maximum: ₦5,000,000. Reject
  outside this range with a clear error.
- A service cannot be deleted if it has active
  bookings (status PENDING_VENDOR, ACCEPTED, or PAID).
  Vendor must complete or cancel those bookings first.
- A vendor must have at least one active service to
  appear in search.

## 4. Vendor Search and Browse

### Behavior

1. Public users visit `/vendors`.
2. The page shows a grid of verified vendors with:
   - Vendor avatar/cover image.
   - Business name with verified badge.
   - Primary category and city.
   - Starting price (lowest service price).
   - Average rating and review count.
3. Filters in a sidebar (collapsible on mobile):
   - Category (multi-select).
   - City (Lagos only in MVP, but UI shows the filter).
   - Price range (slider).
   - Available on date (date picker).
   - Verified only (toggle, default on).
4. Sort options: Recommended (default), Price low-high,
   Price high-low, Rating, Newest.
5. Pagination: 20 results per page.

### Search Implementation

- Filter by `VendorProfile.verificationStatus = APPROVED`.
- Join `Service` for category and price filtering.
- For "Available on date", exclude vendors with a
  booking on that date in status PAID or ACCEPTED.
  (This is approximate; vendors may handle multiple
  events per day. Phase 2 adds explicit availability.)
- Average rating computed from public reviews.

### Rules

- Unverified vendors never appear in search, ever.
- Suspended vendors never appear in search.
- Search must work without JavaScript (server-rendered
  filters via URL params).

## 5. Vendor Detail Page

### URL

`/vendors/[slug]`

### Behavior

1. Page is publicly accessible.
2. Shows:
   - Hero: cover photo or first portfolio image,
     business name, verified badge, city, category,
     average rating.
   - About: bio, years of experience, Instagram link.
   - Services: list of active services with prices
     and "Book Now" CTAs.
   - Portfolio: grid of portfolio images, click to
     enlarge.
   - Reviews: paginated list of public reviews with
     ratings.
3. "Book Now" on a service starts the booking flow.

### Rules

- WhatsApp number is hidden until the user has a
  paid booking with this vendor.
- If the vendor is unverified or suspended, return 404.

## 6. Booking Flow

### Steps

The booking flow is multi-step. Each step has its own
URL so users can refresh and resume.

1. `/book/[serviceId]` — Select date, enter event
   details (location, guest count, special requests).
2. `/book/[serviceId]/review` — Review booking
   summary. If not signed in, prompt to sign in
   (preserve state in URL/session).
3. `/book/[serviceId]/pay` — Show deposit amount
   (30% of total by default), initialize Paystack
   transaction, redirect to Paystack.
4. `/book/confirmed/[bookingCode]` — Confirmation
   page after Paystack callback.

### State Machine

A booking transitions through states. Only these
transitions are allowed:

- `PENDING_VENDOR` → `ACCEPTED` (vendor accepts)
- `PENDING_VENDOR` → `DECLINED` (vendor declines)
- `PENDING_VENDOR` → `CANCELLED` (customer cancels)
- `PENDING_VENDOR` → `EXPIRED` (48hr no response)
- `ACCEPTED` → `PAID` (Paystack webhook confirms)
- `ACCEPTED` → `CANCELLED` (customer cancels before paying)
- `PAID` → `COMPLETED` (customer confirms event happened)
- `PAID` → `DISPUTED` (customer or vendor opens dispute)
- `DISPUTED` → `COMPLETED` (admin resolves for vendor)
- `DISPUTED` → `REFUNDED` (admin resolves for customer)
- `COMPLETED` → (terminal)
- `REFUNDED` → (terminal)
- `DECLINED` → (terminal)
- `CANCELLED` → (terminal)
- `EXPIRED` → (terminal)

### Rules

- The booking amount is computed server-side from
  `Service.priceKobo`. The client never sends a price.
- Deposit is 30% of total. (Configurable later.)
- A booking with status `PENDING_VENDOR` for more than
  48 hours transitions to `EXPIRED` via scheduled
  job.
- A booking cannot be created for a date in the past.
- A booking cannot be created for a date more than
  18 months in the future.
- After payment, the vendor's WhatsApp is revealed
  to the customer.
- The vendor's WhatsApp is shown alongside a message
  like "You can also coordinate with your vendor
  directly on WhatsApp."

## 7. Payment and Escrow

### Flow

1. Customer reaches `/book/[serviceId]/pay`.
2. Server creates a `Payment` row with status
   `INITIALIZED` and calls Paystack
   `/transaction/initialize` with:
   - Amount in kobo.
   - Customer email.
   - Callback URL: `/api/payments/callback`.
   - Metadata: `bookingId`.
3. Customer is redirected to Paystack's hosted page.
4. On payment success, Paystack:
   - Calls the webhook `/api/webhooks/paystack`.
   - Redirects the user to the callback URL.
5. Webhook handler verifies signature, marks payment
   as `SUCCESSFUL`, then `HELD`, and the booking as
   `PAID`. WhatsApp is revealed.

### Escrow Release

- After event date, customer can click "Confirm Event
  Completed" on their booking.
- This sets booking to `COMPLETED` and queues a
  payout task for admin.
- Admin reviews and triggers payout via
  `/admin/payouts` (Paystack Transfer API).
- On successful transfer, `Payment.status = RELEASED`.

### Refunds

- Triggered by admin from `/admin/disputes` when
  resolving for the customer.
- Calls Paystack Refund API.
- On success, `Payment.status = REFUNDED` and
  `Booking.status = REFUNDED`.

### Rules

- Webhooks are idempotent. Check `WebhookEvent`
  table for duplicate event IDs.
- Webhook signature verification is mandatory.
  Unsigned webhooks are rejected with 401.
- All money transitions write to `AuditLog`.
- Customer can request refund only if booking is
  PAID and event date has not passed by more than
  7 days. After that, dispute resolution is the
  only path.

## 8. Reviews

### Behavior

1. After a booking transitions to `COMPLETED`, the
   customer sees a "Leave a Review" prompt on their
   booking detail page.
2. Review form: 1-5 star rating, optional title,
   review body (50-1000 chars).
3. On submit, a `Review` row is created. Vendor's
   average rating is computed dynamically (not stored).

### Rules

- One review per booking. Database constraint enforces.
- Reviews are public by default. Customer can mark
  private (still visible to admin).
- Reviews cannot be edited after 7 days.
- Reviews cannot be deleted by the customer. Admin
  can hide a review by setting `isPublic = false`
  (for spam, abuse).
- Vendors cannot respond to reviews in MVP. Phase 2
  adds vendor responses.

## 9. Dispute Resolution

### Behavior

1. On a `PAID` booking, both customer and vendor see
   a "Report an Issue" button.
2. Clicking opens a form: reason (required, text),
   evidence upload (optional, up to 5 images).
3. On submit, a `Dispute` row is created with status
   `OPEN`. Booking transitions to `DISPUTED`.
4. Admin sees disputes on `/admin/disputes`.
5. Admin reviews messages, payment, and evidence,
   then resolves:
   - **For Customer**: refund. Booking → REFUNDED.
   - **For Vendor**: release payment. Booking → COMPLETED.
   - **No Action**: dispute closed, booking returns
     to PAID.

### Rules

- A dispute can be opened only on a PAID booking.
- Only one active dispute per booking.
- Admin must add a resolution message before
  resolving.
- All dispute actions write to `AuditLog`.

## 10. Notifications

### Email Triggers

Sent via Resend.

| Trigger                              | To       | Template                      |
| ------------------------------------ | -------- | ----------------------------- |
| Vendor verification approved         | Vendor   | `vendor-verified`             |
| Vendor verification rejected         | Vendor   | `vendor-rejected`             |
| New booking request                  | Vendor   | `booking-new-request`         |
| Booking accepted                     | Customer | `booking-accepted`            |
| Booking declined                     | Customer | `booking-declined`            |
| Payment received                     | Both     | `booking-paid`                |
| Event reminder (3 days before)       | Both     | `event-reminder`              |
| Booking completion confirmation      | Vendor   | `booking-completed`           |
| Payout released                      | Vendor   | `payout-released`             |
| Refund processed                     | Customer | `refund-processed`            |
| Dispute opened                       | Other party + admin | `dispute-opened`   |

### Rules

- All emails are sent from a verified Resend domain.
- All emails include an unsubscribe link (legal
  requirement, even for transactional).
- Email templates are React Email components.
- Send failures are logged but do not block the
  triggering action.

## 11. Public Marketing Pages

### Home (`/`)

- Hero with tagline ("Verified vendors. Trusted
  bookings. Real events."), search bar (category +
  city), CTA to browse.
- "How it works" — 3 step explainer.
- Featured categories (Catering, Decoration,
  Photography) with vendor counts.
- 6 featured vendors (highest rated, verified).
- Trust signals: "Verified vendors", "Secure escrow",
  "Dispute protection".
- Testimonials (curated, real).
- CTA: "Are you a vendor? Join EventIQ."

### How It Works (`/how-it-works`)

Detailed explanation of the booking process, escrow,
and dispute resolution.

### For Vendors (`/for-vendors`)

Sales page for vendors: benefits, commission structure
(MVP: free during beta), application process.

### About (`/about`)

Mission, team (if relevant), contact info.

### Contact (`/contact`)

Form that creates an internal support ticket
(simple email forward in MVP).

## 12. Admin Dashboard

### Pages

- `/admin` — overview dashboard with key metrics.
- `/admin/verifications` — pending vendor queue.
- `/admin/users` — search and manage users.
- `/admin/disputes` — open and historical disputes.
- `/admin/payouts` — pending payouts to release.
- `/admin/audit-log` — chronological action log.

### Rules

- All admin pages require `role = ADMIN`.
- Middleware blocks non-admins with 404 (not 403)
  to hide the existence of admin URLs.
- Every admin action writes to `AuditLog`.
