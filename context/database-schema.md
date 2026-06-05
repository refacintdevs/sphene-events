# Database Schema

This is the source of truth for the data model.
Every Prisma model, enum, and relationship is
documented here before it lands in `schema.prisma`.

## Conventions

- Table names: `PascalCase` singular.
- Column names: `camelCase`.
- Primary keys: `id String @id @default(cuid())`.
- Timestamps: `createdAt` and `updatedAt` on every
  mutable table.
- Money: stored as `Int` in kobo (₦1 = 100 kobo).
- Foreign keys are always indexed.
- Soft delete only where flagged. Default is hard
  delete with `onDelete: Cascade` or `Restrict`
  documented per relation.

## Enums

```prisma
enum UserRole {
  CUSTOMER
  VENDOR
  ADMIN
}

enum VerificationStatus {
  UNSUBMITTED       // Vendor has not submitted yet
  PENDING           // Submitted, awaiting admin review
  APPROVED          // Admin verified
  REJECTED          // Admin rejected, vendor can resubmit
  INFO_REQUESTED    // Admin needs more documents
}

enum VendorCategory {
  CATERING
  DECORATION
  PHOTOGRAPHY
  // Phase 2: MUA, DJ, MC, VENUE, BAND, VIDEOGRAPHY
}

enum NigerianState {
  LAGOS
  // Phase 2: ABUJA, RIVERS, OYO, KANO, KADUNA, ENUGU, etc.
}

enum BookingStatus {
  PENDING_VENDOR    // Awaiting vendor accept/decline
  ACCEPTED          // Vendor accepted, awaiting payment
  PAID              // Deposit paid, in escrow
  COMPLETED         // Event happened, customer confirmed
  DECLINED          // Vendor declined
  CANCELLED         // Customer cancelled before vendor accepted
  DISPUTED          // Active dispute
  REFUNDED          // Refund issued to customer
  EXPIRED           // Vendor did not respond in time
}

enum PaymentStatus {
  INITIALIZED       // Paystack transaction created
  SUCCESSFUL        // Payment confirmed via webhook
  HELD              // Funds in escrow
  RELEASED          // Funds released to vendor
  REFUNDED          // Funds returned to customer
  FAILED            // Payment failed
}

enum DocumentType {
  CAC_CERTIFICATE
  GOVERNMENT_ID
  PROOF_OF_ADDRESS
  PORTFOLIO_SAMPLE
  REFERENCE_LETTER
}

enum DisputeStatus {
  OPEN
  UNDER_REVIEW
  RESOLVED_FOR_CUSTOMER
  RESOLVED_FOR_VENDOR
  CLOSED_NO_ACTION
}

enum AuditAction {
  VENDOR_VERIFIED
  VENDOR_REJECTED
  VENDOR_INFO_REQUESTED  // Added Unit 1.4 — admin requested more info
  BOOKING_PAID
  PAYMENT_RELEASED
  PAYMENT_REFUNDED
  DISPUTE_OPENED
  DISPUTE_RESOLVED
  USER_SUSPENDED
  USER_RESTORED
}
```

## Models

### User

The app's user table. One row per Clerk user. The
`clerkId` joins to Clerk's identity record.

```prisma
model User {
  id             String   @id @default(cuid())
  clerkId        String   @unique
  email          String   @unique
  fullName       String
  phoneNumber    String?  // Nigerian format: +234XXXXXXXXXX
  avatarUrl      String?
  role           UserRole @default(CUSTOMER)
  isSuspended    Boolean  @default(false)
  suspendedAt    DateTime?
  suspendedReason String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  vendorProfile  VendorProfile?
  customerBookings Booking[] @relation("CustomerBookings")
  reviewsGiven   Review[]   @relation("ReviewsGiven")
  disputesOpened Dispute[]  @relation("DisputeOpenedBy")
  auditLogsAsActor AuditLog[] @relation("AuditActor")

  @@index([clerkId])
  @@index([role])
}
```

### VendorProfile

One-to-one with `User` for users with `role = VENDOR`.
Holds vendor-specific business data.

```prisma
model VendorProfile {
  id                   String   @id @default(cuid())
  userId               String   @unique
  businessName         String
  slug                 String   @unique  // URL-safe identifier
  bio                  String   @db.Text
  cacNumber            String?  // RC1234567 format
  whatsappNumber       String   // +234XXXXXXXXXX
  instagramHandle      String?
  city                 String   @default("Lagos")
  state                NigerianState @default(LAGOS)
  address              String
  yearsOfExperience    Int      @default(0)
  primaryCategory      VendorCategory?    // Set in onboarding Step 1; nullable for pre-onboarding vendors; admin queue reads it for the category column
  verificationStatus   VerificationStatus @default(UNSUBMITTED)
  verifiedAt           DateTime?
  verificationNotes    String?  @db.Text  // Admin notes on review
  paystackSubaccountCode String? // For Phase 2 auto-payouts
  bankName             String?
  bankAccountNumber    String?
  bankAccountName      String?
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  user                 User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  services             Service[]
  portfolioItems       PortfolioItem[]
  documents            VerificationDocument[]
  bookings             Booking[] @relation("VendorBookings")
  reviewsReceived      Review[]  @relation("ReviewsReceived")

  @@index([verificationStatus])
  @@index([city, state])
  @@index([slug])
}
```

### Service

A bookable package offered by a vendor. A vendor has
many services across one or more categories.

```prisma
model Service {
  id            String         @id @default(cuid())
  vendorId      String
  category      VendorCategory
  title         String         // "Premium Wedding Catering Package"
  description   String         @db.Text
  priceKobo     Int            // Base price in kobo
  durationHours Int?           // Estimated service duration
  servesUpTo    Int?           // For caterers: serves up to X people
  isActive      Boolean        @default(true)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  vendor        VendorProfile  @relation(fields: [vendorId], references: [id], onDelete: Cascade)
  bookings      Booking[]

  @@index([vendorId])
  @@index([category, isActive])
}
```

### PortfolioItem

A single image (or set) in a vendor's portfolio.
The actual binary lives in Cloudinary; we store the
public ID and URL.

```prisma
model PortfolioItem {
  id                String         @id @default(cuid())
  vendorId          String
  cloudinaryPublicId String
  imageUrl          String
  caption           String?
  category          VendorCategory?
  displayOrder      Int            @default(0)
  createdAt         DateTime       @default(now())

  vendor            VendorProfile  @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  @@index([vendorId, displayOrder])
}
```

### VerificationDocument

Documents submitted by vendors for admin verification.
Stored in Cloudinary, referenced here.

```prisma
model VerificationDocument {
  id                String         @id @default(cuid())
  vendorId          String
  type              DocumentType
  cloudinaryPublicId String
  fileUrl           String
  fileName          String
  uploadedAt        DateTime       @default(now())

  vendor            VendorProfile  @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  @@index([vendorId, type])
}
```

### Booking

A booking connects a customer to a vendor for a specific
service on a specific date. This is the heart of the
platform.

```prisma
model Booking {
  id                String         @id @default(cuid())
  bookingCode       String         @unique  // Human-readable: SE-2026-0001
  customerId        String
  vendorId          String
  serviceId         String
  eventDate         DateTime       // Day of the event
  eventLocation     String         // Free text address
  guestCount        Int?
  specialRequests   String?        @db.Text
  totalAmountKobo   Int            // Snapshot of Service.priceKobo at booking time
  depositAmountKobo Int            // What the customer pays now (typically 30-50%)
  balanceAmountKobo Int            // Remaining, paid offline or on completion
  status            BookingStatus  @default(PENDING_VENDOR)
  vendorRespondedAt DateTime?
  paidAt            DateTime?
  completedAt       DateTime?
  cancelledAt       DateTime?
  cancellationReason String?
  whatsappRevealed  Boolean        @default(false)  // True once deposit paid
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt

  customer          User           @relation("CustomerBookings", fields: [customerId], references: [id])
  vendor            VendorProfile  @relation("VendorBookings", fields: [vendorId], references: [id])
  service           Service        @relation(fields: [serviceId], references: [id])
  payment           Payment?
  review            Review?
  dispute           Dispute?

  @@index([customerId, status])
  @@index([vendorId, status])
  @@index([eventDate])
  @@index([status])
}
```

### Payment

One-to-one with `Booking`. Tracks Paystack transaction
state and escrow status.

```prisma
model Payment {
  id                  String        @id @default(cuid())
  bookingId           String        @unique
  paystackReference   String        @unique
  paystackAccessCode  String?
  amountKobo          Int
  status              PaymentStatus @default(INITIALIZED)
  initializedAt       DateTime      @default(now())
  paidAt              DateTime?
  releasedAt          DateTime?
  releasedByUserId    String?       // Admin who released
  refundedAt          DateTime?
  refundReason        String?
  paystackMetadata    Json?         // Raw webhook payload for audit

  booking             Booking       @relation(fields: [bookingId], references: [id], onDelete: Cascade)

  @@index([status])
  @@index([paystackReference])
}
```

### Review

A customer's review of a vendor, tied to a completed
booking. One review per booking (enforced at DB level).

```prisma
model Review {
  id             String   @id @default(cuid())
  bookingId      String   @unique
  customerId     String
  vendorId       String
  rating         Int      // 1-5
  title          String?
  body           String   @db.Text
  isPublic       Boolean  @default(true)
  createdAt      DateTime @default(now())

  booking        Booking       @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  customer       User          @relation("ReviewsGiven", fields: [customerId], references: [id])
  vendor         VendorProfile @relation("ReviewsReceived", fields: [vendorId], references: [id])

  @@index([vendorId, isPublic])
  @@index([rating])
}
```

### Dispute

A dispute on a paid booking. Customer or vendor can
open it. Admin resolves.

```prisma
model Dispute {
  id              String        @id @default(cuid())
  bookingId       String        @unique
  openedByUserId  String
  reason          String        @db.Text
  evidenceUrls    String[]      // Cloudinary URLs
  status          DisputeStatus @default(OPEN)
  resolution      String?       @db.Text
  resolvedAt      DateTime?
  resolvedByUserId String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  booking         Booking       @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  openedBy        User          @relation("DisputeOpenedBy", fields: [openedByUserId], references: [id])

  @@index([status])
}
```

### AuditLog

Append-only log of high-stakes platform actions.

```prisma
model AuditLog {
  id           String      @id @default(cuid())
  action       AuditAction
  actorUserId  String?     // Null for system actions
  subjectType  String      // "VendorProfile", "Booking", "Payment", etc.
  subjectId    String
  details      Json?
  createdAt    DateTime    @default(now())

  actor        User?       @relation("AuditActor", fields: [actorUserId], references: [id])

  @@index([actorUserId])
  @@index([subjectType, subjectId])
  @@index([createdAt])
}
```

### WebhookEvent

Deduplication record for incoming webhooks (Paystack,
Clerk). Prevents replay attacks and ensures idempotency.

```prisma
model WebhookEvent {
  id          String   @id @default(cuid())
  source      String   // "paystack" | "clerk"
  eventId     String   // Provider's event ID
  eventType   String
  payload     Json
  processedAt DateTime @default(now())

  @@unique([source, eventId])
  @@index([source, eventType])
}
```

## Relationships at a Glance

- `User` 1 — 0..1 `VendorProfile`
- `VendorProfile` 1 — N `Service`
- `VendorProfile` 1 — N `PortfolioItem`
- `VendorProfile` 1 — N `VerificationDocument`
- `User` (customer) 1 — N `Booking`
- `VendorProfile` 1 — N `Booking`
- `Service` 1 — N `Booking`
- `Booking` 1 — 0..1 `Payment`
- `Booking` 1 — 0..1 `Review`
- `Booking` 1 — 0..1 `Dispute`
- `User` 1 — N `AuditLog` (as actor)

## Indexes Beyond Foreign Keys

- `User.role` for role-based queries.
- `VendorProfile.verificationStatus` for admin queue.
- `VendorProfile.city, state` for location search.
- `VendorProfile.slug` for public URL lookup.
- `Service.category, isActive` for category browse.
- `Booking.eventDate` for availability checks.
- `Booking.status` for dashboard queries.
- `Review.vendorId, isPublic` for vendor detail page.
- `AuditLog.createdAt` for chronological views.

## Migration Strategy

- Use `prisma migrate dev` in development.
- Use `prisma migrate deploy` in production.
- Never edit a generated migration. If a migration
  is wrong, create a follow-up migration that fixes it.
- Seed data (`prisma/seed.ts`) creates one admin
  user and 3 sample verified vendors for local testing.
