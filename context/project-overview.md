# NaijaVendors — Event Vendor Booking & Marketplace

## Overview

NaijaVendors is a web platform that connects Nigerian event
planners and individuals with verified event vendors —
caterers, decorators, photographers, makeup artists, DJs,
MCs, and venues. The platform solves the trust gap in
Nigeria's informal vendor economy: buyers cannot easily
verify vendor legitimacy, compare pricing transparently, or
recover from no-shows. NaijaVendors addresses this through
admin-verified vendor profiles, escrow-backed payments,
on-platform reviews tied to real bookings, and clear
dispute resolution.

The platform serves three user types: customers (event
hosts and planners), vendors (service providers), and
admins (platform operators who verify vendors and resolve
disputes).

## Goals

1. Onboard 50 verified vendors across 3 categories
   (catering, decoration, photography) in Lagos within
   the first 3 months of launch.
2. Process the first ₦1,000,000 in escrowed bookings
   within 6 months.
3. Maintain a vendor verification turnaround of under
   72 hours from submission to decision.
4. Achieve a booking completion rate above 90%
   (bookings paid → event completed without dispute).

## Core User Flow

### Customer Flow

1. Customer lands on home page and browses verified
   vendors by category, city, or date availability.
2. Customer opens a vendor detail page, views portfolio,
   pricing packages, and reviews.
3. Customer selects a service package and event date,
   then proceeds to booking.
4. Customer signs in (Clerk) or creates an account.
5. Customer reviews booking details and pays a deposit
   via Paystack. Funds are held in escrow.
6. Vendor receives the booking request and accepts or
   declines within 48 hours.
7. On event day, customer confirms event completion.
   Escrow releases funds to vendor.
8. Customer leaves a verified review tied to the
   completed booking.

### Vendor Flow

1. Vendor signs up and selects "Vendor" role.
2. Vendor completes profile: business details, CAC number,
   service categories, pricing packages, portfolio uploads.
3. Vendor submits for admin verification.
4. Once verified, vendor appears in public search.
5. Vendor receives booking requests, accepts or declines.
6. Vendor delivers service on event day.
7. Vendor receives payout via Paystack Subaccount after
   customer confirms completion.

### Admin Flow

1. Admin reviews pending vendor verification submissions.
2. Admin checks CAC registration, portfolio quality,
   and references.
3. Admin approves, rejects (with reason), or requests
   additional documents.
4. Admin monitors disputes and intervenes when buyer
   and vendor cannot resolve directly.

## Features

### Public Pages

- Home page with featured vendors, categories, and
  trust signals.
- Vendor search and browse with filters (category,
  city, price range, date availability, verified-only).
- Vendor detail page with portfolio, packages, reviews,
  and booking CTA.
- "For Vendors" landing page selling vendors on joining.
- "How It Works" page explaining the booking and
  escrow process.
- About and Contact pages.

### Customer Dashboard

- My Bookings — list with status (pending, accepted,
  paid, completed, disputed, refunded).
- Booking detail view with messages, payment status,
  and dispute trigger.
- Reviews — leave reviews on completed bookings.
- Profile settings.

### Vendor Dashboard

- Manage Services — create and edit service packages
  with pricing.
- Manage Bookings — accept, decline, mark completed.
- Portfolio Uploads — drag-to-reorder gallery via
  Cloudinary.
- Earnings and Payouts — view balance, payout history,
  next payout date.
- Verification Status — see review state, resubmit
  documents if rejected.
- Reviews — view reviews received.

### Admin Dashboard

- Verify Vendors — queue of pending submissions with
  approve/reject/request-info actions.
- Manage Users — search, suspend, or restore accounts.
- Disputes — resolve booking disputes with access to
  messages, payment state, and refund controls.
- Reports — flagged content, suspicious activity.
- Analytics — booking volume, GMV, vendor activity.

## Scope

### Phase 1 — MVP (In Scope)

The MVP launches with the minimum surface area needed
to validate the core trust loop: a customer can find,
book, and pay a verified vendor, and the vendor gets
paid only after the event happens.

- Authentication via Clerk with role selection
  (customer or vendor).
- Public pages: Home, Vendors (with search and filters),
  Vendor Detail, For Vendors, How It Works.
- Customer flow: browse → book → pay deposit →
  confirm completion → review.
- Vendor flow: signup → submit verification → manage
  services → accept bookings → receive payout.
- Admin flow: verify vendors, basic dispute view.
- Paystack integration for deposits with manual
  payout trigger (admin-released funds).
- Cloudinary for portfolio image uploads.
- Email notifications for booking state changes
  (Resend or similar).
- Three vendor categories at launch: Catering,
  Decoration, Photography.
- One city at launch: Lagos.

### Phase 2 — Post-MVP (Out of Scope for now)

- In-app messaging between customer and vendor
  (Phase 1 reveals WhatsApp after deposit).
- Favorites and saved searches.
- Advanced analytics dashboard for admin.
- Paystack Subaccounts for automatic split payments
  (Phase 1 uses manual payouts).
- Additional categories: MUA, DJ, MC, Venues, Bands.
- Additional cities: Abuja, Port Harcourt, Ibadan.
- Vendor subscription tiers and featured placements.
- Public pricing page for vendors.
- Mobile native apps.
- Review responses by vendors.
- Calendar sync (Google Calendar).
- Bulk booking and corporate accounts.

### Permanently Out of Scope

- Becoming a vendor management CRM. We are a
  marketplace, not vendor software.
- Multi-currency support. Naira only.
- Vendor-to-vendor transactions.

## Success Criteria

1. A new customer can sign up, find a verified caterer
   in Lagos, book them for a specific date, and pay a
   deposit through Paystack — end to end in under
   10 minutes.
2. A new vendor can sign up, submit verification with
   CAC and portfolio, and receive an admin decision
   within 72 hours.
3. An admin can review a vendor's submission, see all
   required documents, and approve or reject with a
   single action.
4. When a customer confirms event completion, the
   vendor's payout is queued for release within 24 hours.
5. The platform handles 100 concurrent users browsing
   vendors without performance degradation.
6. `npm run build` passes with zero TypeScript errors
   and zero ESLint warnings.
