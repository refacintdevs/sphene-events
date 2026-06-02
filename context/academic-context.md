# Academic Context

This is the most important constraint document for the
project. Every implementation decision must respect
what this file describes. Future Claude Code sessions
and all planning must read this FIRST, before any
other context.

## Project Type

EventIQ is a final-year undergraduate university
project. The build serves a dissertation Chapter 4
(Implementation) deliverable.

## Constraints

- **Deadline**: approximately 4 weeks from Phase 1
  start (Phase 1 opened 2026-06-02). Submission day
  will be confirmed closer to the date.
- **Solo developer**: one student. No team.
- **Approved stack**: Next.js + Node.js (runtime),
  TypeScript, Tailwind, PostgreSQL via Neon, Prisma 7,
  Clerk auth. Supervisor has confirmed stack approval.
- **Grading rubric**: NOT obtained. Planning is based
  on the provided requirements document only. This is
  a known information gap; assumptions made in this
  plan may be incorrect. Re-prioritize if rubric
  becomes available.
- **Demo expectation**: live, in-person demo on
  submission day. Supervisor will click through the
  application. Therefore:
  - Features that are demonstrated MUST actually work
    (no mocked flows, no broken buttons).
  - Robustness during demo matters more than pixel
    polish.
  - The student must be able to navigate the codebase
    live and answer questions about any subsystem.

## Roles Required for Demo

All three user roles must be fully demonstrable in
the live demo:

- **Customer** (CUSTOMER role): browse vendors, view
  vendor detail, make a booking, pay deposit (sandbox),
  leave a review, chat with vendor.
- **Vendor** (VENDOR role): register, complete
  verification submission, list services, upload
  portfolio, manage bookings, see earnings, chat with
  customer.
- **Admin** (ADMIN role): review pending verifications,
  approve/reject vendors, view bookings, resolve
  disputes, view security logs.

Note: the university requirements document lists
"Event Planner" and "Client" as separate roles. Our
data model collapses both into CUSTOMER. The
rationale: a customer is anyone booking vendors,
whether for themselves or as a planner for a third
party. This is a deliberate normalization decision
documented under "Assumptions and constraints" in
Chapter 4. The student is prepared to defend it.

## Schema-to-Requirement Mapping

The university requirements document lists tables
named `users`, `vendors`, `events`, `vendor_requests`,
`quotes`, `bookings`, `payment_transactions`,
`conversations`, `messages`, `security_logs`. Our
Prisma schema uses a domain-driven normalization that
does not 1:1 match these names. The mapping is:

- `users` → `User`
- `vendors` → `VendorProfile`
- `events` → NOT a separate table. An "event" is the
  date, location, and guest count attached to a
  `Booking`. No event exists in our system
  independent of a booking.
- `vendor_requests` → a `Booking` in
  `PENDING_VENDOR` status.
- `quotes` → a snapshot of `Service.priceKobo`
  captured into `Booking.totalAmountKobo` at booking
  creation.
- `bookings` → `Booking`
- `payment_transactions` → `Payment`
- `conversations` → `Conversation` (added Phase 1
  Unit 3.1)
- `messages` → `Message` (added Phase 1 Unit 3.1)
- `security_logs` → `AuditLog` (extended in Unit 3.4
  to cover failed logins and rate-limit hits, in
  addition to existing platform actions)

This is a deliberate design choice: separate tables
for `events`, `quotes`, and `vendor_requests` would
have created joins with no business value, because
the lifecycle of each concept is bound to the
lifecycle of a Booking. The Booking-centric model is
documented in Chapter 4 with this rationale.

## Acceptable Compromises

The supervisor accepts a "partial demo" — not every
edge case must be covered. Specifically:

- Refund logic can be demonstrated with a button +
  webhook handler, without fully unwinding a real
  Paystack transaction.
- Some admin features (analytics, reports) can be
  stubbed if documented.
- Test coverage can be partial; a representative
  sample of tests (target 8–15 unit tests) is
  acceptable.
- Real-time chat uses Server-Sent Events (one-way,
  server-to-client), not WebSocket. This is
  sufficient for a chatbot demo and substantially
  simpler to implement. Documented as a legitimate
  alternative under Chapter 4 Requirement 6 (the
  requirements document lists WebSocket/Socket.io/
  Laravel Reverb as examples, not a closed set).
- Email notifications can be stubbed (logged to
  console) for the academic build; production email
  is a post-submission task.

## Continuous Deployment

The Vercel deployment is kept live and updated
throughout Phase 1. Each unit's changes deploy on
push to main. The live URL is used for:

- Demonstrating progress to the supervisor in
  intermediate meetings (if any).
- Building Chapter 4 screenshots from a real
  deployed environment, not localhost.
- Demo-day fallback in case the local environment
  fails.

The Vercel subdomain remains `sphene-events.vercel.app`
(the historical project name). The application
content displays "EventIQ". The mismatch is cosmetic
and will be addressed when a real domain is attached.

## Chapter 4 Requirements (Summary)

The detailed list lives in
`context/uploads/project-requirements.txt`. Tracking
lives in `chapter-4-evidence.md`. Summary:

1. Working code + screenshots for each module
2. Final database schema with 5+ rows per core table
3. Security implementation (auth, RBAC, hashing,
   encryption, CSRF, rate limiting)
4. Payment gateway integration (Paystack sandbox)
5. Chatbot (real-time via SSE for this project)
6. System architecture diagram
7. UI walkthrough per role (annotated screenshots)
8. Testing evidence (unit tests + test case tables +
   bug log)
9. Deployment / environment setup documentation
10. Assumptions and constraints documented
11. Code snippets for critical functions

## Risks

- **Rubric unknown**: priorities are guessed. If the
  supervisor weighs an area we under-invest in, marks
  suffer.
- **Real-time chat complexity**: SSE is the simplest
  viable approach; if it fails during demo, fallback
  is to show stored messages with manual refresh.
- **Payment integration**: Paystack sandbox setup
  has dependencies (test keys, webhook configuration)
  that can consume disproportionate time.
- **Three-role demonstration breadth**: 18–20 screens
  in 4 weeks alongside payment, chat, security
  documentation, and the Chapter 4 prose. Tight.
- **Bug-fix budget**: real-world demos surface bugs.
  Week 4 is reserved for testing and stabilization,
  not new features.

## Anti-Patterns to Avoid

- Polish over function: spending time on visual craft
  on screens that aren't critical to the demo.
- Over-engineering: building flexibility for features
  that will never run.
- Late-stage refactors: any refactor in week 4 risks
  breaking the demo.
- Silent stubs: every stubbed/mocked feature must be
  clearly labeled in code AND in Chapter 4 prose.
- Assuming the rubric: priorities documented here are
  best guesses; flag and revisit if information
  becomes available.