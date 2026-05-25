import {
  PrismaClient,
  UserRole,
  VerificationStatus,
  VendorCategory,
  NigerianState,
  BookingStatus,
  PaymentStatus,
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
  vendor1:   "user_seed_vendor_001",   // Folake's Kitchen (CATERING)
  vendor2:   "user_seed_vendor_002",   // Tunde Lens Studio (PHOTOGRAPHY)
  vendor3:   "user_seed_vendor_003",   // House of Lush (DECORATION)
  customer1: "user_seed_customer_001", // Chinonso Eze
  customer2: "user_seed_customer_002", // Fatima Bello
  // Legacy IDs from a prior seed run — include so cleanup handles them too
  legacyVendor1:   "clerk_vendor_seed_001",
  legacyVendor2:   "clerk_vendor_seed_002",
  legacyCustomer1: "clerk_customer_seed_001",
  legacyCustomer2: "clerk_customer_seed_002",
  legacyAdmin:     "clerk_admin_seed_001",
};

async function cleanup() {
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
      email:    "admin@spheneevents.com",
      fullName: "Sphene Admin",
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

  await prisma.user.create({
    data: {
      clerkId:     IDS.customer2,
      email:       "fatima.bello@example.test",
      fullName:    "Fatima Bello",
      phoneNumber: "+2347034567890",
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
        imageUrl:           "https://placehold.co/800x600/E66B2C/FFFFFF?text=Sphene+Seed",
        caption:            "Traditional wedding spread for 400 guests — Lagos Continental",
        category:           VendorCategory.CATERING,
        displayOrder:       0,
      },
      {
        id:                 "seed_portfolio_002",
        vendorId:           v1Profile.id,
        cloudinaryPublicId: "seed/portfolio/folakes-kitchen-2",
        imageUrl:           "https://placehold.co/800x600/E66B2C/FFFFFF?text=Sphene+Seed",
        caption:            "Corporate brunch — Sterling Bank annual conference",
        category:           VendorCategory.CATERING,
        displayOrder:       1,
      },
      {
        id:                 "seed_portfolio_003",
        vendorId:           v1Profile.id,
        cloudinaryPublicId: "seed/portfolio/folakes-kitchen-3",
        imageUrl:           "https://placehold.co/800x600/E66B2C/FFFFFF?text=Sphene+Seed",
        caption:            "Naming ceremony catering — Yoruba traditional menu",
        category:           VendorCategory.CATERING,
        displayOrder:       2,
      },
      {
        id:                 "seed_portfolio_004",
        vendorId:           v1Profile.id,
        cloudinaryPublicId: "seed/portfolio/folakes-kitchen-4",
        imageUrl:           "https://placehold.co/800x600/E66B2C/FFFFFF?text=Sphene+Seed",
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
        imageUrl:           "https://placehold.co/800x600/2C8B6E/FFFFFF?text=Sphene+Seed",
        caption:            "White wedding — Eko Hotels, December 2025",
        category:           VendorCategory.PHOTOGRAPHY,
        displayOrder:       0,
      },
      {
        id:                 "seed_portfolio_006",
        vendorId:           v2Profile.id,
        cloudinaryPublicId: "seed/portfolio/tunde-lens-studio-2",
        imageUrl:           "https://placehold.co/800x600/2C8B6E/FFFFFF?text=Sphene+Seed",
        caption:            "Traditional engagement — Adebayo & Funke",
        category:           VendorCategory.PHOTOGRAPHY,
        displayOrder:       1,
      },
      {
        id:                 "seed_portfolio_007",
        vendorId:           v2Profile.id,
        cloudinaryPublicId: "seed/portfolio/tunde-lens-studio-3",
        imageUrl:           "https://placehold.co/800x600/2C8B6E/FFFFFF?text=Sphene+Seed",
        caption:            "Corporate headshots — Access Bank executive team",
        category:           VendorCategory.PHOTOGRAPHY,
        displayOrder:       2,
      },
      {
        id:                 "seed_portfolio_008",
        vendorId:           v2Profile.id,
        cloudinaryPublicId: "seed/portfolio/tunde-lens-studio-4",
        imageUrl:           "https://placehold.co/800x600/2C8B6E/FFFFFF?text=Sphene+Seed",
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
        imageUrl:           "https://placehold.co/800x600/8B2C6E/FFFFFF?text=Sphene+Seed",
        caption:            "Luxury white wedding — 350-guest hall draping",
        category:           VendorCategory.DECORATION,
        displayOrder:       0,
      },
      {
        id:                 "seed_portfolio_010",
        vendorId:           v3Profile.id,
        cloudinaryPublicId: "seed/portfolio/house-of-lush-2",
        imageUrl:           "https://placehold.co/800x600/8B2C6E/FFFFFF?text=Sphene+Seed",
        caption:            "Tech conference stage design — Andela summit",
        category:           VendorCategory.DECORATION,
        displayOrder:       1,
      },
      {
        id:                 "seed_portfolio_011",
        vendorId:           v3Profile.id,
        cloudinaryPublicId: "seed/portfolio/house-of-lush-3",
        imageUrl:           "https://placehold.co/800x600/8B2C6E/FFFFFF?text=Sphene+Seed",
        caption:            "50th birthday — gold and ivory theme",
        category:           VendorCategory.DECORATION,
        displayOrder:       2,
      },
      {
        id:                 "seed_portfolio_012",
        vendorId:           v3Profile.id,
        cloudinaryPublicId: "seed/portfolio/house-of-lush-4",
        imageUrl:           "https://placehold.co/800x600/8B2C6E/FFFFFF?text=Sphene+Seed",
        caption:            "Corporate gala — minimalist black & white",
        category:           VendorCategory.DECORATION,
        displayOrder:       3,
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

  // ── Summary ───────────────────────────────────────────────────────────────
  const [users, vendors, services, portfolio, bookings, payments] = await Promise.all([
    prisma.user.count(),
    prisma.vendorProfile.count(),
    prisma.service.count(),
    prisma.portfolioItem.count(),
    prisma.booking.count(),
    prisma.payment.count(),
  ]);

  const paymentRow = await prisma.payment.findFirst();
  const bookingRow = await prisma.booking.findFirst();

  console.log("\n── Seed complete ──────────────────────────────────────");
  console.log(`  Users:          ${users} (1 admin, 3 vendors, 2 customers)`);
  console.log(`  VendorProfiles: ${vendors} (all APPROVED)`);
  console.log(`  Services:       ${services} (2 catering, 2 photography, 2 decoration)`);
  console.log(`  PortfolioItems: ${portfolio} (4 per vendor)`);
  console.log(`  Bookings:       ${bookings} (${bookingRow?.bookingCode}, status: ${bookingRow?.status}, whatsappRevealed: ${bookingRow?.whatsappRevealed})`);
  console.log(`  Payments:       ${payments} (status: ${paymentRow?.status}, amountKobo: ${paymentRow?.amountKobo})`);
  console.log("────────────────────────────────────────────────────────\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
