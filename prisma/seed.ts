import {
  PrismaClient,
  UserRole,
  VerificationStatus,
  VendorCategory,
  NigerianState,
  BookingStatus,
  PaymentStatus,
  AuditAction,
} from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";

neonConfig.webSocketConstructor = globalThis.WebSocket;
process.loadEnvFile(".env.local");

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Stable clerkIds — never change these; they are the upsert keys.
const IDS = {
  admin:     "user_seed_admin_001",
  vendor1:   "user_seed_vendor_001",   // Folake's Kitchen (CATERING, APPROVED)
  vendor2:   "user_seed_vendor_002",   // Tunde Lens Studio (PHOTOGRAPHY, APPROVED)
  vendor3:   "user_seed_vendor_003",   // House of Lush (DECORATION, APPROVED)
  vendor4:   "user_seed_vendor_004",   // Bright Clicks Studio (PHOTOGRAPHY, PENDING)
  vendor5:   "user_seed_vendor_005",   // Chef Amaka's Table (CATERING, APPROVED)
  customer1: "user_seed_customer_001", // Chinonso Eze
  customer2: "user_seed_customer_002", // Fatima Bello
  customer3: "user_seed_customer_003", // Obiageli Chukwu
  customer4: "user_seed_customer_004", // Rasheed Olanrewaju
  // Legacy IDs from a prior seed run — include so cleanup handles them too
  legacyVendor1:   "clerk_vendor_seed_001",
  legacyVendor2:   "clerk_vendor_seed_002",
  legacyCustomer1: "clerk_customer_seed_001",
  legacyCustomer2: "clerk_customer_seed_002",
  legacyAdmin:     "clerk_admin_seed_001",
};

async function cleanup() {
  // AuditLog.actorUserId is SetNull on user delete (nullable FK) — rows survive but orphan.
  // WebhookEvent has no FK at all. Delete both explicitly so re-runs are fully clean.
  await prisma.auditLog.deleteMany({});
  await prisma.webhookEvent.deleteMany({});

  // Delete bookings first — both User.customerBookings and VendorProfile.bookings
  // use RESTRICT, so FK violation if we delete users while bookings exist.
  await prisma.booking.deleteMany({ where: { bookingCode: { startsWith: "SE-2026-" } } });

  // Deleting a User cascades: VendorProfile → Services, PortfolioItems, VerificationDocuments.
  const allSeedClerkIds = Object.values(IDS);

  await prisma.user.deleteMany({ where: { clerkId: { in: allSeedClerkIds } } });
}

async function main() {
  await cleanup();

  // ── Admin ──────────────────────────────────────────────────────────────────
  await prisma.user.create({
    data: {
      clerkId:  IDS.admin,
      email:    "admin@eventiq.com",
      fullName: "EventIQ Admin",
      role:     UserRole.ADMIN,
    },
  });

  // ── Customers ─────────────────────────────────────────────────────────────
  const customer1 = await prisma.user.create({
    data: {
      clerkId:     IDS.customer1,
      email:       "chinonso.eze@example.test",
      fullName:    "Chinonso Eze",
      phoneNumber: "+2348055512345",
      role:        UserRole.CUSTOMER,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      clerkId:     IDS.customer2,
      email:       "fatima.bello@example.test",
      fullName:    "Fatima Bello",
      phoneNumber: "+2347034567890",
      role:        UserRole.CUSTOMER,
    },
  });

  const customer3 = await prisma.user.create({
    data: {
      clerkId:     IDS.customer3,
      email:       "obiageli.chukwu@example.test",
      fullName:    "Obiageli Chukwu",
      phoneNumber: "+2348034567891",
      role:        UserRole.CUSTOMER,
    },
  });

  const customer4 = await prisma.user.create({
    data: {
      clerkId:     IDS.customer4,
      email:       "rasheed.olanrewaju@example.test",
      fullName:    "Rasheed Olanrewaju",
      phoneNumber: "+2348090123456",
      role:        UserRole.CUSTOMER,
    },
  });

  // ── Vendor 1 — Folake's Kitchen (CATERING) ────────────────────────────────
  const v1User = await prisma.user.create({
    data: {
      clerkId:     IDS.vendor1,
      email:       "folake@folakeskitchen.test",
      fullName:    "Folake Adeyemi",
      phoneNumber: "+2348012345678",
      role:        UserRole.VENDOR,
    },
  });

  const v1Profile = await prisma.vendorProfile.create({
    data: {
      userId:             v1User.id,
      businessName:       "Folake's Kitchen",
      slug:               "folakes-kitchen",
      bio:                "Lagos's most sought-after wedding caterer. From traditional Yoruba spreads to contemporary continental buffets, we feed up to 500 guests with precision and warmth. Ten years, ten thousand plates.",
      cacNumber:          "RC2345678",
      whatsappNumber:     "+2348012345678",
      instagramHandle:    "folakeskitchen_ng",
      city:               "Lagos",
      state:              NigerianState.LAGOS,
      address:            "22 Allen Avenue, Ikeja, Lagos",
      yearsOfExperience:  10,
      verificationStatus: VerificationStatus.APPROVED,
      verifiedAt:         new Date("2026-04-25T10:00:00Z"),
      bankName:           "First Bank of Nigeria",
      bankAccountNumber:  "3012345678",
      bankAccountName:    "FOLAKE ADEYEMI CATERING SERVICES",
    },
  });

  const v1Service1 = await prisma.service.create({
    data: {
      id:           "seed_service_001",
      vendorId:     v1Profile.id,
      category:     VendorCategory.CATERING,
      title:        "Premium Wedding Catering Package",
      description:  "Full-service wedding catering for up to 400 guests. Includes jollof rice, fried rice, assorted proteins, pepper soup, small chops, and full bar setup. Dedicated waitstaff, chafing dishes, and post-event cleanup included.",
      priceKobo:    50_000_000,
      servesUpTo:   400,
      isActive:     true,
    },
  });

  await prisma.service.create({
    data: {
      id:          "seed_service_002",
      vendorId:    v1Profile.id,
      category:    VendorCategory.CATERING,
      title:       "Corporate Event Buffet",
      description: "Professional buffet catering for corporate events, product launches, and seminars. Serves up to 150 guests. Curated Nigerian and continental menu with halal options available on request.",
      priceKobo:   20_000_000,
      servesUpTo:  150,
      isActive:    true,
    },
  });

  await prisma.portfolioItem.createMany({
    data: [
      {
        id:                 "seed_portfolio_001",
        vendorId:           v1Profile.id,
        cloudinaryPublicId: "seed/portfolio/folakes-kitchen-1",
        imageUrl:           "https://placehold.co/800x600/E66B2C/FFFFFF?text=EventIQ+Seed",
        caption:            "Traditional wedding spread for 400 guests — Lagos Continental",
        category:           VendorCategory.CATERING,
        displayOrder:       0,
      },
      {
        id:                 "seed_portfolio_002",
        vendorId:           v1Profile.id,
        cloudinaryPublicId: "seed/portfolio/folakes-kitchen-2",
        imageUrl:           "https://placehold.co/800x600/E66B2C/FFFFFF?text=EventIQ+Seed",
        caption:            "Corporate brunch — Sterling Bank annual conference",
        category:           VendorCategory.CATERING,
        displayOrder:       1,
      },
      {
        id:                 "seed_portfolio_003",
        vendorId:           v1Profile.id,
        cloudinaryPublicId: "seed/portfolio/folakes-kitchen-3",
        imageUrl:           "https://placehold.co/800x600/E66B2C/FFFFFF?text=EventIQ+Seed",
        caption:            "Naming ceremony catering — Yoruba traditional menu",
        category:           VendorCategory.CATERING,
        displayOrder:       2,
      },
      {
        id:                 "seed_portfolio_004",
        vendorId:           v1Profile.id,
        cloudinaryPublicId: "seed/portfolio/folakes-kitchen-4",
        imageUrl:           "https://placehold.co/800x600/E66B2C/FFFFFF?text=EventIQ+Seed",
        caption:            "60th birthday celebration — full bar service",
        category:           VendorCategory.CATERING,
        displayOrder:       3,
      },
    ],
  });

  // ── Vendor 2 — Tunde Lens Studio (PHOTOGRAPHY) ───────────────────────────
  const v2User = await prisma.user.create({
    data: {
      clerkId:     IDS.vendor2,
      email:       "tunde@tundelensstudio.test",
      fullName:    "Tunde Bakare",
      phoneNumber: "+2348098765432",
      role:        UserRole.VENDOR,
    },
  });

  const v2Profile = await prisma.vendorProfile.create({
    data: {
      userId:             v2User.id,
      businessName:       "Tunde Lens Studio",
      slug:               "tunde-lens-studio",
      bio:                "Award-winning Lagos wedding and event photographer. Six years capturing the real moments — the tears, the laughter, the details nobody else notices. Full-day coverage to four-hour packages.",
      cacNumber:          "RC3456789",
      whatsappNumber:     "+2348098765432",
      instagramHandle:    "tundelens",
      city:               "Lagos",
      state:              NigerianState.LAGOS,
      address:            "7 Olu Akerele Street, Surulere, Lagos",
      yearsOfExperience:  6,
      verificationStatus: VerificationStatus.APPROVED,
      verifiedAt:         new Date("2026-04-25T10:00:00Z"),
      bankName:           "Zenith Bank",
      bankAccountNumber:  "2134567890",
      bankAccountName:    "TUNDE BAKARE PHOTOGRAPHY",
    },
  });

  await prisma.service.create({
    data: {
      id:           "seed_service_003",
      vendorId:     v2Profile.id,
      category:     VendorCategory.PHOTOGRAPHY,
      title:        "Full Day Wedding Coverage",
      description:  "Complete wedding day photography from bridal prep through reception. 12 hours of coverage, 500+ edited images delivered via private online gallery within 3 weeks. Lead photographer plus one assistant.",
      priceKobo:    35_000_000,
      durationHours: 12,
      isActive:     true,
    },
  });

  await prisma.service.create({
    data: {
      id:           "seed_service_004",
      vendorId:     v2Profile.id,
      category:     VendorCategory.PHOTOGRAPHY,
      title:        "Event Photography (4 Hours)",
      description:  "Four-hour event photography for birthdays, naming ceremonies, and corporate events. 150+ edited images delivered within 5 business days.",
      priceKobo:    15_000_000,
      durationHours: 4,
      isActive:     true,
    },
  });

  await prisma.portfolioItem.createMany({
    data: [
      {
        id:                 "seed_portfolio_005",
        vendorId:           v2Profile.id,
        cloudinaryPublicId: "seed/portfolio/tunde-lens-studio-1",
        imageUrl:           "https://placehold.co/800x600/2C8B6E/FFFFFF?text=EventIQ+Seed",
        caption:            "White wedding — Eko Hotels, December 2025",
        category:           VendorCategory.PHOTOGRAPHY,
        displayOrder:       0,
      },
      {
        id:                 "seed_portfolio_006",
        vendorId:           v2Profile.id,
        cloudinaryPublicId: "seed/portfolio/tunde-lens-studio-2",
        imageUrl:           "https://placehold.co/800x600/2C8B6E/FFFFFF?text=EventIQ+Seed",
        caption:            "Traditional engagement — Adebayo & Funke",
        category:           VendorCategory.PHOTOGRAPHY,
        displayOrder:       1,
      },
      {
        id:                 "seed_portfolio_007",
        vendorId:           v2Profile.id,
        cloudinaryPublicId: "seed/portfolio/tunde-lens-studio-3",
        imageUrl:           "https://placehold.co/800x600/2C8B6E/FFFFFF?text=EventIQ+Seed",
        caption:            "Corporate headshots — Access Bank executive team",
        category:           VendorCategory.PHOTOGRAPHY,
        displayOrder:       2,
      },
      {
        id:                 "seed_portfolio_008",
        vendorId:           v2Profile.id,
        cloudinaryPublicId: "seed/portfolio/tunde-lens-studio-4",
        imageUrl:           "https://placehold.co/800x600/2C8B6E/FFFFFF?text=EventIQ+Seed",
        caption:            "Naming ceremony — full event coverage",
        category:           VendorCategory.PHOTOGRAPHY,
        displayOrder:       3,
      },
    ],
  });

  // ── Vendor 3 — House of Lush (DECORATION) ────────────────────────────────
  const v3User = await prisma.user.create({
    data: {
      clerkId:     IDS.vendor3,
      email:       "adaeze@houseoflush.test",
      fullName:    "Adaeze Okonkwo",
      phoneNumber: "+2348023456789",
      role:        UserRole.VENDOR,
    },
  });

  const v3Profile = await prisma.vendorProfile.create({
    data: {
      userId:             v3User.id,
      businessName:       "House of Lush",
      slug:               "house-of-lush",
      bio:                "Luxury event decoration for weddings, corporate galas, and milestone celebrations. We craft immersive environments from concept to execution. Based in Lekki, serving Lagos and surrounds.",
      cacNumber:          "RC1234567",
      whatsappNumber:     "+2348023456789",
      instagramHandle:    "houseoflush_lagos",
      city:               "Lekki",
      state:              NigerianState.LAGOS,
      address:            "14 Admiralty Way, Lekki Phase 1, Lagos",
      yearsOfExperience:  7,
      verificationStatus: VerificationStatus.APPROVED,
      verifiedAt:         new Date("2026-04-25T10:00:00Z"),
      bankName:           "Guaranty Trust Bank",
      bankAccountNumber:  "0123456789",
      bankAccountName:    "HOUSE OF LUSH LIMITED",
    },
  });

  await prisma.service.create({
    data: {
      id:           "seed_service_005",
      vendorId:     v3Profile.id,
      category:     VendorCategory.DECORATION,
      title:        "Classic Wedding Decoration Package",
      description:  "Full-venue decoration for weddings up to 300 guests. Includes draping, floral centerpieces, lighting design, ceremonial backdrop, and reception styling. Setup and breakdown included.",
      priceKobo:    85_000_000,
      durationHours: 12,
      isActive:     true,
    },
  });

  await prisma.service.create({
    data: {
      id:          "seed_service_006",
      vendorId:    v3Profile.id,
      category:    VendorCategory.DECORATION,
      title:       "Corporate Event Styling",
      description: "Sophisticated decor for corporate galas, product launches, and award nights. Includes stage design, branded backdrops, table setting, and ambient lighting.",
      priceKobo:   65_000_000,
      durationHours: 8,
      isActive:    true,
    },
  });

  await prisma.portfolioItem.createMany({
    data: [
      {
        id:                 "seed_portfolio_009",
        vendorId:           v3Profile.id,
        cloudinaryPublicId: "seed/portfolio/house-of-lush-1",
        imageUrl:           "https://placehold.co/800x600/8B2C6E/FFFFFF?text=EventIQ+Seed",
        caption:            "Luxury white wedding — 350-guest hall draping",
        category:           VendorCategory.DECORATION,
        displayOrder:       0,
      },
      {
        id:                 "seed_portfolio_010",
        vendorId:           v3Profile.id,
        cloudinaryPublicId: "seed/portfolio/house-of-lush-2",
        imageUrl:           "https://placehold.co/800x600/8B2C6E/FFFFFF?text=EventIQ+Seed",
        caption:            "Tech conference stage design — Andela summit",
        category:           VendorCategory.DECORATION,
        displayOrder:       1,
      },
      {
        id:                 "seed_portfolio_011",
        vendorId:           v3Profile.id,
        cloudinaryPublicId: "seed/portfolio/house-of-lush-3",
        imageUrl:           "https://placehold.co/800x600/8B2C6E/FFFFFF?text=EventIQ+Seed",
        caption:            "50th birthday — gold and ivory theme",
        category:           VendorCategory.DECORATION,
        displayOrder:       2,
      },
      {
        id:                 "seed_portfolio_012",
        vendorId:           v3Profile.id,
        cloudinaryPublicId: "seed/portfolio/house-of-lush-4",
        imageUrl:           "https://placehold.co/800x600/8B2C6E/FFFFFF?text=EventIQ+Seed",
        caption:            "Corporate gala — minimalist black & white",
        category:           VendorCategory.DECORATION,
        displayOrder:       3,
      },
    ],
  });

  // ── Vendor 4 — Bright Clicks Studio (PHOTOGRAPHY, PENDING) ──────────────
  // Used to populate the admin verification queue in Unit 1.4 and beyond.
  const v4User = await prisma.user.create({
    data: {
      clerkId:     IDS.vendor4,
      email:       "emeka@brightclicks.test",
      fullName:    "Emeka Okafor",
      phoneNumber: "+2348077654321",
      role:        UserRole.VENDOR,
    },
  });

  const v4Profile = await prisma.vendorProfile.create({
    data: {
      userId:             v4User.id,
      businessName:       "Bright Clicks Studio",
      slug:               "bright-clicks-studio",
      bio:                "Event and portrait photography studio based in Yaba, Lagos. Specialising in weddings, engagement shoots, and corporate headshots. Modern editing style with a focus on natural light and candid moments.",
      cacNumber:          null,
      whatsappNumber:     "+2348077654321",
      instagramHandle:    "brightclicks_ng",
      city:               "Yaba",
      state:              NigerianState.LAGOS,
      address:            "5 Herbert Macaulay Way, Yaba, Lagos",
      yearsOfExperience:  3,
      verificationStatus: VerificationStatus.PENDING,
      bankName:           "Access Bank",
      bankAccountNumber:  "0987654321",
      bankAccountName:    "EMEKA OKAFOR",
    },
  });

  // Services for Bright Clicks Studio — required so that approving the vendor
  // in the admin queue causes it to appear on /vendors (which filters by ≥1
  // active service). Priced below the established Tunde Lens Studio to reflect
  // fewer years of experience (3 vs 6) and no CAC registration.
  await prisma.service.create({
    data: {
      id:            "seed_service_007",
      vendorId:      v4Profile.id,
      category:      VendorCategory.PHOTOGRAPHY,
      title:         "Wedding Photography Package",
      description:   "Full wedding day photography for up to 8 hours. Bridal prep, ceremony, and reception coverage. 300+ professionally edited images delivered via private online gallery within 2 weeks. Solo photographer, modern natural-light editing style.",
      priceKobo:     20_000_000,
      durationHours: 8,
      isActive:      true,
    },
  });

  await prisma.service.create({
    data: {
      id:            "seed_service_008",
      vendorId:      v4Profile.id,
      category:      VendorCategory.PHOTOGRAPHY,
      title:         "Engagement & Portrait Session",
      description:   "Two-hour engagement shoot or portrait session at a location of your choice in Lagos. 60+ edited images delivered within 5 business days. Print-ready high-resolution files included.",
      priceKobo:     7_000_000,
      durationHours: 2,
      isActive:      true,
    },
  });

  // ── Vendor 5 — Chef Amaka's Table (CATERING, APPROVED) ──────────────────
  const v5User = await prisma.user.create({
    data: {
      clerkId:     IDS.vendor5,
      email:       "amaka@chefamakastable.test",
      fullName:    "Amaka Nwosu",
      phoneNumber: "+2348061234567",
      role:        UserRole.VENDOR,
    },
  });

  const v5Profile = await prisma.vendorProfile.create({
    data: {
      userId:             v5User.id,
      businessName:       "Chef Amaka's Table",
      slug:               "chef-amakas-table",
      bio:                "Homegrown catering from the heart of Gbagada. Amaka Nwosu has been feeding Lagos families for over five years — owambe spreads, naming ceremonies, and intimate birthday dinners. Everything made fresh, every time.",
      cacNumber:          null,
      whatsappNumber:     "+2348061234567",
      instagramHandle:    "chefamakas_table",
      city:               "Gbagada",
      state:              NigerianState.LAGOS,
      address:            "3 Gbagada Phase 2 Road, Gbagada, Lagos",
      yearsOfExperience:  5,
      verificationStatus: VerificationStatus.APPROVED,
      verifiedAt:         new Date("2026-05-01T09:00:00Z"),
      bankName:           "Kuda Bank",
      bankAccountNumber:  "2087654321",
      bankAccountName:    "AMAKA NWOSU",
    },
  });

  await prisma.service.create({
    data: {
      id:          "seed_service_009",
      vendorId:    v5Profile.id,
      category:    VendorCategory.CATERING,
      title:       "Owambe Celebration Catering",
      description: "Full owambe party catering for 60–100 guests. Includes jollof rice, fried rice, assorted grilled proteins, moi moi, small chops selection, and drinks station. Waitstaff and cleanup included. Perfect for birthdays, anniversaries, and outdoor parties.",
      priceKobo:   30_000_000,
      servesUpTo:  100,
      isActive:    true,
    },
  });

  await prisma.service.create({
    data: {
      id:          "seed_service_010",
      vendorId:    v5Profile.id,
      category:    VendorCategory.CATERING,
      title:       "Naming Ceremony & Small Chops Package",
      description: "Naming ceremony catering and small chops service for up to 50 guests. Includes chin chin, spring rolls, puff puff, samosa, suya, and asun. Plus a pot of pepper soup and a traditional naming-day sweet drink. Delivery and setup within Lagos included.",
      priceKobo:   12_000_000,
      servesUpTo:  50,
      isActive:    true,
    },
  });

  await prisma.portfolioItem.createMany({
    data: [
      {
        id:                 "seed_portfolio_013",
        vendorId:           v5Profile.id,
        cloudinaryPublicId: "seed/portfolio/chef-amakas-table-1",
        imageUrl:           "https://placehold.co/800x600/D4943A/FFFFFF?text=EventIQ+Seed",
        caption:            "Owambe jollof rice and assorted proteins — 80-guest spread",
        category:           VendorCategory.CATERING,
        displayOrder:       0,
      },
      {
        id:                 "seed_portfolio_014",
        vendorId:           v5Profile.id,
        cloudinaryPublicId: "seed/portfolio/chef-amakas-table-2",
        imageUrl:           "https://placehold.co/800x600/D4943A/FFFFFF?text=EventIQ+Seed",
        caption:            "Naming ceremony table setup — traditional Igbo menu",
        category:           VendorCategory.CATERING,
        displayOrder:       1,
      },
      {
        id:                 "seed_portfolio_015",
        vendorId:           v5Profile.id,
        cloudinaryPublicId: "seed/portfolio/chef-amakas-table-3",
        imageUrl:           "https://placehold.co/800x600/D4943A/FFFFFF?text=EventIQ+Seed",
        caption:            "Small chops platter — chin chin, puff puff, suya and asun",
        category:           VendorCategory.CATERING,
        displayOrder:       2,
      },
    ],
  });

  // ── Booking SE-2026-0001 ──────────────────────────────────────────────────
  const booking = await prisma.booking.create({
    data: {
      bookingCode:       "SE-2026-0001",
      customerId:        customer1.id,
      vendorId:          v1Profile.id,
      serviceId:         v1Service1.id,
      eventDate:         new Date("2026-08-23T16:00:00Z"),
      eventLocation:     "Civic Centre Hall, Ozumba Mbadiwe Avenue, Victoria Island, Lagos",
      guestCount:        250,
      specialRequests:   "Vegetarian options for 30 guests. No pork in the main menu.",
      totalAmountKobo:   50_000_000,
      depositAmountKobo: 15_000_000,
      balanceAmountKobo: 35_000_000,
      status:            BookingStatus.PAID,
      vendorRespondedAt: new Date("2026-05-17T18:00:00Z"),
      paidAt:            new Date("2026-05-18T10:05:00Z"),
      whatsappRevealed:  true,
      createdAt:         new Date("2026-05-17T14:00:00Z"),
    },
  });

  // ── Payment (linked to booking) ───────────────────────────────────────────
  await prisma.payment.create({
    data: {
      bookingId:          booking.id,
      paystackReference:  "pay_seed_test_ref_001",
      paystackAccessCode: "seed_access_code_001",
      amountKobo:         15_000_000,
      status:             PaymentStatus.HELD,
      initializedAt:      new Date("2026-05-18T10:00:00Z"),
      paidAt:             new Date("2026-05-18T10:05:00Z"),
      paystackMetadata:   {
        event: "charge.success",
        data: {
          reference: "pay_seed_test_ref_001",
          amount:    15_000_000,
          currency:  "NGN",
          channel:   "card",
          status:    "success",
        },
      },
    },
  });

  // ── Additional Bookings (Unit 1.5 expansion) ─────────────────────────────
  // Deposits are exactly 30% of total; balance = total − deposit (all kobo Int).
  // eventDate: COMPLETED/DISPUTED/REFUNDED = past; PENDING_VENDOR/ACCEPTED/DECLINED = future.
  // whatsappRevealed = true only for statuses that went through PAID.

  // SE-2026-0002: COMPLETED — Fatima @ Folake's Kitchen (Corporate Buffet, 120 guests)
  await prisma.booking.create({
    data: {
      bookingCode:       "SE-2026-0002",
      customerId:        customer2.id,
      vendorId:          v1Profile.id,
      serviceId:         "seed_service_002",
      eventDate:         new Date("2026-03-15T13:00:00Z"),
      eventLocation:     "The Wheatbaker Hotel, 4 Lawrence Road, Ikoyi, Lagos",
      guestCount:        120,
      specialRequests:   "Halal menu required for all guests.",
      totalAmountKobo:   20_000_000,
      depositAmountKobo: 6_000_000,  // 30% of 20M
      balanceAmountKobo: 14_000_000, // 20M − 6M
      status:            BookingStatus.COMPLETED,
      vendorRespondedAt: new Date("2026-03-01T10:00:00Z"),
      paidAt:            new Date("2026-03-02T09:30:00Z"),
      completedAt:       new Date("2026-03-16T00:00:00Z"),
      whatsappRevealed:  true,
      createdAt:         new Date("2026-02-28T08:00:00Z"),
    },
  });

  // SE-2026-0003: COMPLETED — Obiageli @ Folake's Kitchen (Premium Wedding Catering, 380 guests)
  await prisma.booking.create({
    data: {
      bookingCode:       "SE-2026-0003",
      customerId:        customer3.id,
      vendorId:          v1Profile.id,
      serviceId:         "seed_service_001",
      eventDate:         new Date("2026-04-05T15:00:00Z"),
      eventLocation:     "Landmark Centre, Water Corporation Drive, Oniru, Lagos",
      guestCount:        380,
      specialRequests:   "No seafood for the top table. Smoothies for the children's corner, please.",
      totalAmountKobo:   50_000_000,
      depositAmountKobo: 15_000_000, // 30% of 50M
      balanceAmountKobo: 35_000_000, // 50M − 15M
      status:            BookingStatus.COMPLETED,
      vendorRespondedAt: new Date("2026-03-22T11:00:00Z"),
      paidAt:            new Date("2026-03-23T14:15:00Z"),
      completedAt:       new Date("2026-04-06T00:00:00Z"),
      whatsappRevealed:  true,
      createdAt:         new Date("2026-03-20T09:00:00Z"),
    },
  });

  // SE-2026-0004: COMPLETED — Chinonso @ Tunde Lens Studio (Full Day Wedding Coverage)
  await prisma.booking.create({
    data: {
      bookingCode:       "SE-2026-0004",
      customerId:        customer1.id,
      vendorId:          v2Profile.id,
      serviceId:         "seed_service_003",
      eventDate:         new Date("2026-03-08T08:00:00Z"),
      eventLocation:     "Balmoral Convention Centre, Federal Palace Hotel, Victoria Island, Lagos",
      guestCount:        300,
      specialRequests:   "Please capture the traditional morning prayers before the ceremony.",
      totalAmountKobo:   35_000_000,
      depositAmountKobo: 10_500_000, // 30% of 35M
      balanceAmountKobo: 24_500_000, // 35M − 10.5M
      status:            BookingStatus.COMPLETED,
      vendorRespondedAt: new Date("2026-02-25T16:00:00Z"),
      paidAt:            new Date("2026-02-26T11:00:00Z"),
      completedAt:       new Date("2026-03-09T00:00:00Z"),
      whatsappRevealed:  true,
      createdAt:         new Date("2026-02-23T10:00:00Z"),
    },
  });

  // SE-2026-0005: COMPLETED — Rasheed @ Tunde Lens Studio (Event Photography 4hr)
  await prisma.booking.create({
    data: {
      bookingCode:       "SE-2026-0005",
      customerId:        customer4.id,
      vendorId:          v2Profile.id,
      serviceId:         "seed_service_004",
      eventDate:         new Date("2026-04-19T15:00:00Z"),
      eventLocation:     "Eko Gardens Event Hall, Lekki Phase 1, Lagos",
      guestCount:        80,
      totalAmountKobo:   15_000_000,
      depositAmountKobo: 4_500_000,  // 30% of 15M
      balanceAmountKobo: 10_500_000, // 15M − 4.5M
      status:            BookingStatus.COMPLETED,
      vendorRespondedAt: new Date("2026-04-10T09:00:00Z"),
      paidAt:            new Date("2026-04-11T12:00:00Z"),
      completedAt:       new Date("2026-04-20T00:00:00Z"),
      whatsappRevealed:  true,
      createdAt:         new Date("2026-04-08T14:00:00Z"),
    },
  });

  // SE-2026-0006: COMPLETED — Fatima @ House of Lush (Classic Wedding Decoration, Valentine's Day)
  await prisma.booking.create({
    data: {
      bookingCode:       "SE-2026-0006",
      customerId:        customer2.id,
      vendorId:          v3Profile.id,
      serviceId:         "seed_service_005",
      eventDate:         new Date("2026-02-14T10:00:00Z"),
      eventLocation:     "The Civic Centre, Ozumba Mbadiwe Avenue, Victoria Island, Lagos",
      guestCount:        250,
      specialRequests:   "Red and white floral theme. The bride's family requested white lilies for the aisle.",
      totalAmountKobo:   85_000_000,
      depositAmountKobo: 25_500_000, // 30% of 85M
      balanceAmountKobo: 59_500_000, // 85M − 25.5M
      status:            BookingStatus.COMPLETED,
      vendorRespondedAt: new Date("2026-01-25T14:00:00Z"),
      paidAt:            new Date("2026-01-26T10:30:00Z"),
      completedAt:       new Date("2026-02-15T00:00:00Z"),
      whatsappRevealed:  true,
      createdAt:         new Date("2026-01-20T11:00:00Z"),
    },
  });

  // SE-2026-0007: PENDING_VENDOR — Obiageli @ Chef Amaka's Table (Owambe Catering)
  await prisma.booking.create({
    data: {
      bookingCode:       "SE-2026-0007",
      customerId:        customer3.id,
      vendorId:          v5Profile.id,
      serviceId:         "seed_service_009",
      eventDate:         new Date("2026-09-13T14:00:00Z"),
      eventLocation:     "Church hall reception, Gbagada General Hospital Road, Lagos",
      guestCount:        90,
      specialRequests:   "The birthday celebrant loves pepper soup — please include extra for the high table.",
      totalAmountKobo:   30_000_000,
      depositAmountKobo: 9_000_000,  // 30% of 30M
      balanceAmountKobo: 21_000_000, // 30M − 9M
      status:            BookingStatus.PENDING_VENDOR,
      whatsappRevealed:  false,
      createdAt:         new Date("2026-06-01T10:00:00Z"),
    },
  });

  // SE-2026-0008: ACCEPTED — Rasheed @ House of Lush (Corporate Event Styling)
  await prisma.booking.create({
    data: {
      bookingCode:       "SE-2026-0008",
      customerId:        customer4.id,
      vendorId:          v3Profile.id,
      serviceId:         "seed_service_006",
      eventDate:         new Date("2026-09-20T17:00:00Z"),
      eventLocation:     "Radisson Blu Anchorage Hotel, 1A Ozumba Mbadiwe, Victoria Island, Lagos",
      guestCount:        200,
      specialRequests:   "Branded step-and-repeat backdrop with company logo. Design assets to follow.",
      totalAmountKobo:   65_000_000,
      depositAmountKobo: 19_500_000, // 30% of 65M
      balanceAmountKobo: 45_500_000, // 65M − 19.5M
      status:            BookingStatus.ACCEPTED,
      vendorRespondedAt: new Date("2026-05-28T13:00:00Z"),
      whatsappRevealed:  false,
      createdAt:         new Date("2026-05-25T09:00:00Z"),
    },
  });

  // SE-2026-0009: DISPUTED — Rasheed @ Folake's Kitchen (Corporate Buffet, 130 guests)
  await prisma.booking.create({
    data: {
      bookingCode:       "SE-2026-0009",
      customerId:        customer4.id,
      vendorId:          v1Profile.id,
      serviceId:         "seed_service_002",
      eventDate:         new Date("2026-05-10T12:00:00Z"),
      eventLocation:     "Sterling Towers, 20 Marina, Lagos Island, Lagos",
      guestCount:        130,
      specialRequests:   "All dishes must be nut-free.",
      totalAmountKobo:   20_000_000,
      depositAmountKobo: 6_000_000,  // 30% of 20M
      balanceAmountKobo: 14_000_000, // 20M − 6M
      status:            BookingStatus.DISPUTED,
      vendorRespondedAt: new Date("2026-04-15T11:00:00Z"),
      paidAt:            new Date("2026-04-16T15:30:00Z"),
      whatsappRevealed:  true,
      createdAt:         new Date("2026-04-10T08:00:00Z"),
    },
  });

  // SE-2026-0010: REFUNDED — Fatima @ Tunde Lens Studio (Full Day Wedding Coverage)
  await prisma.booking.create({
    data: {
      bookingCode:       "SE-2026-0010",
      customerId:        customer2.id,
      vendorId:          v2Profile.id,
      serviceId:         "seed_service_003",
      eventDate:         new Date("2026-05-05T09:00:00Z"),
      eventLocation:     "Eko Hotel & Suites, 1415 Adetokunbo Ademola Street, Victoria Island, Lagos",
      guestCount:        400,
      totalAmountKobo:   35_000_000,
      depositAmountKobo: 10_500_000, // 30% of 35M
      balanceAmountKobo: 24_500_000, // 35M − 10.5M
      status:            BookingStatus.REFUNDED,
      vendorRespondedAt: new Date("2026-04-08T10:00:00Z"),
      paidAt:            new Date("2026-04-10T14:00:00Z"),
      whatsappRevealed:  true,
      createdAt:         new Date("2026-04-05T09:00:00Z"),
    },
  });

  // SE-2026-0011: DECLINED — Chinonso @ Chef Amaka's Table (Naming Ceremony & Small Chops)
  await prisma.booking.create({
    data: {
      bookingCode:        "SE-2026-0011",
      customerId:         customer1.id,
      vendorId:           v5Profile.id,
      serviceId:          "seed_service_010",
      eventDate:          new Date("2026-10-18T11:00:00Z"),
      eventLocation:      "Family compound, Omole Phase 1, Lagos",
      guestCount:         45,
      totalAmountKobo:    12_000_000,
      depositAmountKobo:  3_600_000,  // 30% of 12M
      balanceAmountKobo:  8_400_000,  // 12M − 3.6M
      status:             BookingStatus.DECLINED,
      vendorRespondedAt:  new Date("2026-05-30T16:00:00Z"),
      cancelledAt:        new Date("2026-05-30T16:00:00Z"),
      cancellationReason: "We are fully booked on this date and cannot accommodate your event. We apologise for the inconvenience and hope to serve you at a future occasion.",
      whatsappRevealed:   false,
      createdAt:          new Date("2026-05-28T14:00:00Z"),
    },
  });

  // ── PART 2: Payments ─────────────────────────────────────────────────────
  // Fetch admin user id (Payment.releasedByUserId is a plain String, not a FK,
  // but we store the real admin cuid for data integrity).
  const adminUser = await prisma.user.findUniqueOrThrow({
    where:  { clerkId: IDS.admin },
    select: { id: true },
  });

  // Booking IDs are runtime CUIDs — look them up by bookingCode.
  // One query covers all 7 paid-through bookings (5 COMPLETED + 1 DISPUTED + 1 REFUNDED).
  const paymentBookingRows = await prisma.booking.findMany({
    where: {
      bookingCode: {
        in: [
          "SE-2026-0002", "SE-2026-0003", "SE-2026-0004",
          "SE-2026-0005", "SE-2026-0006", "SE-2026-0009", "SE-2026-0010",
        ],
      },
    },
    select: { id: true, bookingCode: true },
  });
  // bk["SE-2026-XXXX"] → booking.id (used as bookingId FK in Payment and Review)
  const bk = Object.fromEntries(paymentBookingRows.map(b => [b.bookingCode, b.id]));

  // SE-2026-0002: RELEASED — Fatima @ Folake's Kitchen (Corporate Buffet ₦200k)
  await prisma.payment.create({
    data: {
      bookingId:          bk["SE-2026-0002"],
      paystackReference:  "seed_ref_002",
      paystackAccessCode: "seed_access_002",
      amountKobo:         6_000_000,
      status:             PaymentStatus.RELEASED,
      initializedAt:      new Date("2026-03-02T09:00:00Z"),
      paidAt:             new Date("2026-03-02T09:30:00Z"),
      releasedAt:         new Date("2026-03-18T11:00:00Z"),
      releasedByUserId:   adminUser.id,
      paystackMetadata:   { event: "charge.success", data: { reference: "seed_ref_002", amount: 6_000_000, currency: "NGN", channel: "card", status: "success" } },
    },
  });

  // SE-2026-0003: RELEASED — Obiageli @ Folake's Kitchen (Premium Wedding ₦500k)
  await prisma.payment.create({
    data: {
      bookingId:          bk["SE-2026-0003"],
      paystackReference:  "seed_ref_003",
      paystackAccessCode: "seed_access_003",
      amountKobo:         15_000_000,
      status:             PaymentStatus.RELEASED,
      initializedAt:      new Date("2026-03-23T14:00:00Z"),
      paidAt:             new Date("2026-03-23T14:15:00Z"),
      releasedAt:         new Date("2026-04-09T10:00:00Z"),
      releasedByUserId:   adminUser.id,
      paystackMetadata:   { event: "charge.success", data: { reference: "seed_ref_003", amount: 15_000_000, currency: "NGN", channel: "card", status: "success" } },
    },
  });

  // SE-2026-0004: RELEASED — Chinonso @ Tunde Lens Studio (Full Day Wedding ₦350k)
  await prisma.payment.create({
    data: {
      bookingId:          bk["SE-2026-0004"],
      paystackReference:  "seed_ref_004",
      paystackAccessCode: "seed_access_004",
      amountKobo:         10_500_000,
      status:             PaymentStatus.RELEASED,
      initializedAt:      new Date("2026-02-26T10:30:00Z"),
      paidAt:             new Date("2026-02-26T11:00:00Z"),
      releasedAt:         new Date("2026-03-12T09:00:00Z"),
      releasedByUserId:   adminUser.id,
      paystackMetadata:   { event: "charge.success", data: { reference: "seed_ref_004", amount: 10_500_000, currency: "NGN", channel: "card", status: "success" } },
    },
  });

  // SE-2026-0005: RELEASED — Rasheed @ Tunde Lens Studio (Event Photography 4hr ₦150k)
  await prisma.payment.create({
    data: {
      bookingId:          bk["SE-2026-0005"],
      paystackReference:  "seed_ref_005",
      paystackAccessCode: "seed_access_005",
      amountKobo:         4_500_000,
      status:             PaymentStatus.RELEASED,
      initializedAt:      new Date("2026-04-11T11:30:00Z"),
      paidAt:             new Date("2026-04-11T12:00:00Z"),
      releasedAt:         new Date("2026-04-23T14:00:00Z"),
      releasedByUserId:   adminUser.id,
      paystackMetadata:   { event: "charge.success", data: { reference: "seed_ref_005", amount: 4_500_000, currency: "NGN", channel: "card", status: "success" } },
    },
  });

  // SE-2026-0006: RELEASED — Fatima @ House of Lush (Classic Wedding Decoration ₦850k)
  await prisma.payment.create({
    data: {
      bookingId:          bk["SE-2026-0006"],
      paystackReference:  "seed_ref_006",
      paystackAccessCode: "seed_access_006",
      amountKobo:         25_500_000,
      status:             PaymentStatus.RELEASED,
      initializedAt:      new Date("2026-01-26T10:00:00Z"),
      paidAt:             new Date("2026-01-26T10:30:00Z"),
      releasedAt:         new Date("2026-02-18T09:00:00Z"),
      releasedByUserId:   adminUser.id,
      paystackMetadata:   { event: "charge.success", data: { reference: "seed_ref_006", amount: 25_500_000, currency: "NGN", channel: "card", status: "success" } },
    },
  });

  // SE-2026-0009: HELD — Rasheed @ Folake's Kitchen (deposit frozen mid-dispute)
  await prisma.payment.create({
    data: {
      bookingId:          bk["SE-2026-0009"],
      paystackReference:  "seed_ref_009",
      paystackAccessCode: "seed_access_009",
      amountKobo:         6_000_000,
      status:             PaymentStatus.HELD,
      initializedAt:      new Date("2026-04-16T15:00:00Z"),
      paidAt:             new Date("2026-04-16T15:30:00Z"),
      paystackMetadata:   { event: "charge.success", data: { reference: "seed_ref_009", amount: 6_000_000, currency: "NGN", channel: "card", status: "success" } },
    },
  });

  // SE-2026-0010: REFUNDED — Fatima @ Tunde Lens Studio (vendor emergency, full refund)
  await prisma.payment.create({
    data: {
      bookingId:          bk["SE-2026-0010"],
      paystackReference:  "seed_ref_010",
      paystackAccessCode: "seed_access_010",
      amountKobo:         10_500_000,
      status:             PaymentStatus.REFUNDED,
      initializedAt:      new Date("2026-04-10T13:30:00Z"),
      paidAt:             new Date("2026-04-10T14:00:00Z"),
      refundedAt:         new Date("2026-05-03T16:00:00Z"),
      refundReason:       "Vendor informed customer 2 days before the event that they could not fulfil the booking due to a family emergency. Full deposit refunded as vendor was unable to provide service.",
      paystackMetadata:   { event: "charge.success", data: { reference: "seed_ref_010", amount: 10_500_000, currency: "NGN", channel: "card", status: "success" } },
    },
  });

  // ── PART 2: Reviews ───────────────────────────────────────────────────────
  // One review per COMPLETED booking (5 total). bookingId from bk[] map above.
  // customerId + vendorId must match the booking — checked against PART 1 manifest.
  // Ratings: 5, 4, 5, 3, 4 — realistic spread with at least one below-average.
  // createdAt is after the booking's completedAt (you review after the event).

  // SE-2026-0002: Fatima (5★) → Folake's Kitchen
  await prisma.review.create({
    data: {
      bookingId:  bk["SE-2026-0002"],
      customerId: customer2.id,
      vendorId:   v1Profile.id,
      rating:     5,
      title:      "Excellent catering — corporate event was a success",
      body:       "Folake's Kitchen absolutely delivered for our quarterly leadership summit at the Wheatbaker. Every dish was on point — the jollof was smoky and well-seasoned, the fried rice perfect, and the halal options were handled with care and no cross-contamination issues. Guests kept going back for seconds. Waitstaff were professional and kept the buffet well-stocked throughout the event. Will definitely book again for our next corporate function.",
      isPublic:   true,
      createdAt:  new Date("2026-03-17T10:00:00Z"),
    },
  });

  // SE-2026-0003: Obiageli (4★) → Folake's Kitchen
  await prisma.review.create({
    data: {
      bookingId:  bk["SE-2026-0003"],
      customerId: customer3.id,
      vendorId:   v1Profile.id,
      rating:     4,
      title:      "Beautiful food, minor setup delay",
      body:       "The food was genuinely excellent and guests were very satisfied — the traditional soup station was a hit with the elders, and the small chops kept everyone happy during the cocktail hour. My only feedback is that setup took slightly longer than agreed, which gave us a few nervous minutes before the ceremony. But once everything was running, the service was seamless. Four stars for the timing hiccup, but the food itself deserves a solid five. Would still recommend.",
      isPublic:   true,
      createdAt:  new Date("2026-04-07T09:00:00Z"),
    },
  });

  // SE-2026-0004: Chinonso (5★) → Tunde Lens Studio
  await prisma.review.create({
    data: {
      bookingId:  bk["SE-2026-0004"],
      customerId: customer1.id,
      vendorId:   v2Profile.id,
      rating:     5,
      title:      "Tunde captured our day perfectly",
      body:       "Tunde captured our entire day beautifully. From the traditional morning prayers to the last dance of the reception, every important moment was documented with care and skill. He has a way of being present everywhere without making you feel followed or overly posed. The gallery arrived in under three weeks and we were genuinely emotional going through the photos. This is someone who truly loves what he does, and it shows in every frame. Highly recommend without hesitation.",
      isPublic:   true,
      createdAt:  new Date("2026-03-10T14:00:00Z"),
    },
  });

  // SE-2026-0005: Rasheed (3★) → Tunde Lens Studio
  await prisma.review.create({
    data: {
      bookingId:  bk["SE-2026-0005"],
      customerId: customer4.id,
      vendorId:   v2Profile.id,
      rating:     3,
      title:      "Decent photos but below expectations",
      body:       "Photos were decent quality but I expected more for the price point. We received around 90 edited photos — fewer than the 150+ advertised. Some key moments from the birthday dance were missed because the photographer was on a break at that point. Communication before the event was fine, but on the day there was a stretch where I could not locate him. Not a terrible experience overall, but I would want a clear written commitment on photo count and coverage schedule before booking again.",
      isPublic:   true,
      createdAt:  new Date("2026-04-21T11:00:00Z"),
    },
  });

  // SE-2026-0006: Fatima (4★) → House of Lush
  await prisma.review.create({
    data: {
      bookingId:  bk["SE-2026-0006"],
      customerId: customer2.id,
      vendorId:   v3Profile.id,
      rating:     4,
      title:      "Stunning decoration — minor design deviation",
      body:       "House of Lush transformed the Civic Centre into something truly beautiful for our Valentine's Day wedding. The floral arrangements were executed elegantly — white lilies throughout, exactly as the bride's family requested. The draping and lighting gave the hall such a warm, romantic feel that guests were genuinely impressed. One star off because a few of the centrepieces had slightly different greenery from what was agreed in the brief, but most guests would not notice. The team worked quickly and professionally throughout setup. Impressive work overall.",
      isPublic:   true,
      createdAt:  new Date("2026-02-16T08:00:00Z"),
    },
  });

  // ── PART 3: AuditLog ─────────────────────────────────────────────────────
  // Look up Payment IDs by stable paystackReference — CUIDs are runtime-generated.
  const auditPaymentRows = await prisma.payment.findMany({
    where: {
      paystackReference: {
        in: [
          "pay_seed_test_ref_001",
          "seed_ref_002", "seed_ref_003", "seed_ref_004",
          "seed_ref_005", "seed_ref_006", "seed_ref_010",
        ],
      },
    },
    select: { id: true, paystackReference: true },
  });
  // pmtId["seed_ref_NNN"] → payment.id  (used as subjectId in PAYMENT_* audit entries)
  const pmtId = Object.fromEntries(auditPaymentRows.map(p => [p.paystackReference, p.id]));

  // VENDOR_VERIFIED × 4 APPROVED vendors — actor: admin
  await prisma.auditLog.createMany({
    data: [
      {
        action:      AuditAction.VENDOR_VERIFIED,
        actorUserId: adminUser.id,
        subjectType: "VendorProfile",
        subjectId:   v1Profile.id,
        details:     { businessName: "Folake's Kitchen", category: "CATERING" },
        createdAt:   new Date("2026-04-25T10:10:00Z"),
      },
      {
        action:      AuditAction.VENDOR_VERIFIED,
        actorUserId: adminUser.id,
        subjectType: "VendorProfile",
        subjectId:   v2Profile.id,
        details:     { businessName: "Tunde Lens Studio", category: "PHOTOGRAPHY" },
        createdAt:   new Date("2026-04-25T10:20:00Z"),
      },
      {
        action:      AuditAction.VENDOR_VERIFIED,
        actorUserId: adminUser.id,
        subjectType: "VendorProfile",
        subjectId:   v3Profile.id,
        details:     { businessName: "House of Lush", category: "DECORATION" },
        createdAt:   new Date("2026-04-25T10:30:00Z"),
      },
      {
        action:      AuditAction.VENDOR_VERIFIED,
        actorUserId: adminUser.id,
        subjectType: "VendorProfile",
        subjectId:   v5Profile.id,
        details:     { businessName: "Chef Amaka's Table", category: "CATERING" },
        createdAt:   new Date("2026-05-01T09:15:00Z"),
      },
    ],
  });

  // BOOKING_PAID × 8 paid-through bookings — actor: null (system; Paystack webhook triggers this)
  await prisma.auditLog.createMany({
    data: [
      {
        action:      AuditAction.BOOKING_PAID,
        actorUserId: null,
        subjectType: "Booking",
        subjectId:   booking.id,
        details:     { bookingCode: "SE-2026-0001", depositAmountKobo: 15_000_000, paystackReference: "pay_seed_test_ref_001" },
        createdAt:   new Date("2026-05-18T10:05:00Z"),
      },
      {
        action:      AuditAction.BOOKING_PAID,
        actorUserId: null,
        subjectType: "Booking",
        subjectId:   bk["SE-2026-0002"],
        details:     { bookingCode: "SE-2026-0002", depositAmountKobo: 6_000_000, paystackReference: "seed_ref_002" },
        createdAt:   new Date("2026-03-02T09:30:00Z"),
      },
      {
        action:      AuditAction.BOOKING_PAID,
        actorUserId: null,
        subjectType: "Booking",
        subjectId:   bk["SE-2026-0003"],
        details:     { bookingCode: "SE-2026-0003", depositAmountKobo: 15_000_000, paystackReference: "seed_ref_003" },
        createdAt:   new Date("2026-03-23T14:15:00Z"),
      },
      {
        action:      AuditAction.BOOKING_PAID,
        actorUserId: null,
        subjectType: "Booking",
        subjectId:   bk["SE-2026-0004"],
        details:     { bookingCode: "SE-2026-0004", depositAmountKobo: 10_500_000, paystackReference: "seed_ref_004" },
        createdAt:   new Date("2026-02-26T11:00:00Z"),
      },
      {
        action:      AuditAction.BOOKING_PAID,
        actorUserId: null,
        subjectType: "Booking",
        subjectId:   bk["SE-2026-0005"],
        details:     { bookingCode: "SE-2026-0005", depositAmountKobo: 4_500_000, paystackReference: "seed_ref_005" },
        createdAt:   new Date("2026-04-11T12:00:00Z"),
      },
      {
        action:      AuditAction.BOOKING_PAID,
        actorUserId: null,
        subjectType: "Booking",
        subjectId:   bk["SE-2026-0006"],
        details:     { bookingCode: "SE-2026-0006", depositAmountKobo: 25_500_000, paystackReference: "seed_ref_006" },
        createdAt:   new Date("2026-01-26T10:30:00Z"),
      },
      {
        action:      AuditAction.BOOKING_PAID,
        actorUserId: null,
        subjectType: "Booking",
        subjectId:   bk["SE-2026-0009"],
        details:     { bookingCode: "SE-2026-0009", depositAmountKobo: 6_000_000, paystackReference: "seed_ref_009" },
        createdAt:   new Date("2026-04-16T15:30:00Z"),
      },
      {
        action:      AuditAction.BOOKING_PAID,
        actorUserId: null,
        subjectType: "Booking",
        subjectId:   bk["SE-2026-0010"],
        details:     { bookingCode: "SE-2026-0010", depositAmountKobo: 10_500_000, paystackReference: "seed_ref_010" },
        createdAt:   new Date("2026-04-10T14:00:00Z"),
      },
    ],
  });

  // PAYMENT_RELEASED × 5 — actor: admin (matches Payment.releasedByUserId)
  await prisma.auditLog.createMany({
    data: [
      {
        action:      AuditAction.PAYMENT_RELEASED,
        actorUserId: adminUser.id,
        subjectType: "Payment",
        subjectId:   pmtId["seed_ref_002"],
        details:     { paystackReference: "seed_ref_002", amountKobo: 6_000_000, bookingCode: "SE-2026-0002" },
        createdAt:   new Date("2026-03-18T11:00:00Z"),
      },
      {
        action:      AuditAction.PAYMENT_RELEASED,
        actorUserId: adminUser.id,
        subjectType: "Payment",
        subjectId:   pmtId["seed_ref_003"],
        details:     { paystackReference: "seed_ref_003", amountKobo: 15_000_000, bookingCode: "SE-2026-0003" },
        createdAt:   new Date("2026-04-09T10:00:00Z"),
      },
      {
        action:      AuditAction.PAYMENT_RELEASED,
        actorUserId: adminUser.id,
        subjectType: "Payment",
        subjectId:   pmtId["seed_ref_004"],
        details:     { paystackReference: "seed_ref_004", amountKobo: 10_500_000, bookingCode: "SE-2026-0004" },
        createdAt:   new Date("2026-03-12T09:00:00Z"),
      },
      {
        action:      AuditAction.PAYMENT_RELEASED,
        actorUserId: adminUser.id,
        subjectType: "Payment",
        subjectId:   pmtId["seed_ref_005"],
        details:     { paystackReference: "seed_ref_005", amountKobo: 4_500_000, bookingCode: "SE-2026-0005" },
        createdAt:   new Date("2026-04-23T14:00:00Z"),
      },
      {
        action:      AuditAction.PAYMENT_RELEASED,
        actorUserId: adminUser.id,
        subjectType: "Payment",
        subjectId:   pmtId["seed_ref_006"],
        details:     { paystackReference: "seed_ref_006", amountKobo: 25_500_000, bookingCode: "SE-2026-0006" },
        createdAt:   new Date("2026-02-18T09:00:00Z"),
      },
    ],
  });

  // PAYMENT_REFUNDED × 1 — actor: admin
  await prisma.auditLog.create({
    data: {
      action:      AuditAction.PAYMENT_REFUNDED,
      actorUserId: adminUser.id,
      subjectType: "Payment",
      subjectId:   pmtId["seed_ref_010"],
      details:     { paystackReference: "seed_ref_010", amountKobo: 10_500_000, bookingCode: "SE-2026-0010", reason: "Vendor unable to fulfil booking due to family emergency" },
      createdAt:   new Date("2026-05-03T16:00:00Z"),
    },
  });

  // DISPUTE_OPENED × 1 — actor: customer4 (Rasheed opened the dispute on SE-2026-0009)
  await prisma.auditLog.create({
    data: {
      action:      AuditAction.DISPUTE_OPENED,
      actorUserId: customer4.id,
      subjectType: "Booking",
      subjectId:   bk["SE-2026-0009"],
      details:     { bookingCode: "SE-2026-0009", reason: "Vendor failed to provide nut-free dishes as agreed. Multiple guests experienced allergic reactions." },
      createdAt:   new Date("2026-05-11T14:00:00Z"),
    },
  });

  // ── PART 3: WebhookEvents ─────────────────────────────────────────────────
  // SEED PLACEHOLDERS — real Paystack webhook events are received and stored in
  // Unit 2.3 when the handler at /api/webhooks/paystack is implemented.
  // @@unique([source, eventId]) — all eventIds below are distinct.
  await prisma.webhookEvent.createMany({
    data: [
      {
        source:      "paystack",
        eventId:     "seed_evt_001",
        eventType:   "charge.success",
        payload:     { event: "charge.success", data: { reference: "pay_seed_test_ref_001", amount: 15_000_000, currency: "NGN", status: "success" } },
        processedAt: new Date("2026-05-18T10:05:00Z"),
      },
      {
        source:      "paystack",
        eventId:     "seed_evt_002",
        eventType:   "charge.success",
        payload:     { event: "charge.success", data: { reference: "seed_ref_002", amount: 6_000_000, currency: "NGN", status: "success" } },
        processedAt: new Date("2026-03-02T09:30:00Z"),
      },
      {
        source:      "paystack",
        eventId:     "seed_evt_003",
        eventType:   "charge.success",
        payload:     { event: "charge.success", data: { reference: "seed_ref_003", amount: 15_000_000, currency: "NGN", status: "success" } },
        processedAt: new Date("2026-03-23T14:15:00Z"),
      },
      {
        source:      "paystack",
        eventId:     "seed_evt_004",
        eventType:   "charge.success",
        payload:     { event: "charge.success", data: { reference: "seed_ref_004", amount: 10_500_000, currency: "NGN", status: "success" } },
        processedAt: new Date("2026-02-26T11:00:00Z"),
      },
      {
        source:      "paystack",
        eventId:     "seed_evt_005",
        eventType:   "charge.success",
        payload:     { event: "charge.success", data: { reference: "seed_ref_005", amount: 4_500_000, currency: "NGN", status: "success" } },
        processedAt: new Date("2026-04-11T12:00:00Z"),
      },
      {
        source:      "paystack",
        eventId:     "seed_evt_006",
        eventType:   "charge.success",
        payload:     { event: "charge.success", data: { reference: "seed_ref_006", amount: 25_500_000, currency: "NGN", status: "success" } },
        processedAt: new Date("2026-01-26T10:30:00Z"),
      },
      {
        source:      "paystack",
        eventId:     "seed_evt_010_refund",
        eventType:   "refund.processed",
        payload:     { event: "refund.processed", data: { reference: "seed_ref_010", amount: 10_500_000, currency: "NGN", status: "success", reason: "Vendor unable to fulfil booking due to family emergency" } },
        processedAt: new Date("2026-05-03T16:10:00Z"),
      },
    ],
  });

  // ── Summary ───────────────────────────────────────────────────────────────
  const [users, vendors, services, portfolio, bookings, payments, reviews, auditLogs, webhookEvents] =
    await Promise.all([
      prisma.user.count(),
      prisma.vendorProfile.count(),
      prisma.service.count(),
      prisma.portfolioItem.count(),
      prisma.booking.count(),
      prisma.payment.count(),
      prisma.review.count(),
      prisma.auditLog.count(),
      prisma.webhookEvent.count(),
    ]);

  console.log("\n── Seed complete ──────────────────────────────────────");
  console.log(`  Users:          ${users}  (1 admin, 5 vendors, 4 customers)`);
  console.log(`  VendorProfiles: ${vendors}  (4 APPROVED, 1 PENDING — Bright Clicks Studio)`);
  console.log(`  Services:       ${services} (4 catering, 4 photography, 2 decoration)`);
  console.log(`  PortfolioItems: ${portfolio} (3–4 per vendor)`);
  console.log(`  Bookings:       ${bookings} (1 PAID · 5 COMPLETED · 1 PENDING_VENDOR · 1 ACCEPTED · 1 DISPUTED · 1 REFUNDED · 1 DECLINED)`);
  console.log(`  Payments:       ${payments}  (1 HELD-existing · 5 RELEASED · 1 HELD-frozen · 1 REFUNDED)`);
  console.log(`  Reviews:        ${reviews}  (5 public — Folake×2 · Tunde×2 · House of Lush×1)`);
  console.log(`  AuditLogs:      ${auditLogs} (4 VENDOR_VERIFIED · 8 BOOKING_PAID · 5 PAYMENT_RELEASED · 1 PAYMENT_REFUNDED · 1 DISPUTE_OPENED)`);
  console.log(`  WebhookEvents:  ${webhookEvents} (6 charge.success · 1 refund.processed — seed placeholders pending Unit 2.3)`);
  console.log("────────────────────────────────────────────────────────\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
