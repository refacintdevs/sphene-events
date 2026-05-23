# Nigerian Context

This file documents Nigeria-specific conventions,
formats, and domain rules that Claude Code would not
know by default. When implementing anything involving
local data, consult this file first.

## Currency

- Currency is Nigerian Naira (₦), ISO code NGN.
- Naira's subunit is kobo. ₦1 = 100 kobo.
- All money in the database is stored as `Int` in
  kobo. Never store as float.
- Paystack APIs expect amounts in kobo.

### Formatting

- Display format: `₦5,000` (no decimals for whole
  naira). Use decimals only when kobo is non-zero
  (rare in practice).
- Use a `formatNaira(kobo: number)` helper. Do not
  inline formatting logic.
- Thousands separator: comma. Decimal separator: dot.
  Standard for Nigeria.
- Examples:
  - `500000` kobo → `₦5,000`
  - `5000000` kobo → `₦50,000`
  - `15000000` kobo → `₦150,000`
  - `100000000` kobo → `₦1,000,000`
  - `1000000000` kobo → `₦10,000,000`

### Common Price Ranges

For sanity checks and example data:

- Photography (event coverage): ₦150,000 – ₦2,000,000
- Catering (per head): ₦5,000 – ₦25,000; total ₦300,000 – ₦5,000,000+
- Decoration: ₦200,000 – ₦3,000,000
- MUA (makeup): ₦30,000 – ₦300,000 per face
- DJ: ₦150,000 – ₦800,000
- MC: ₦100,000 – ₦1,500,000
- Venue: ₦500,000 – ₦10,000,000+

These are rough Lagos ranges in 2026. Tier the
"luxury" segment higher.

## Phone Numbers

- Country code: +234.
- Mobile numbers are 10 digits after the country code.
  Example: `+2348012345678`.
- Local format also accepted: `08012345678` (leading 0).
- Major operator prefixes: 080, 081, 070, 090, 091
  (full mobile), 070x and 081x are common.

### Validation

- Accept both `+234XXXXXXXXXX` and `0XXXXXXXXXX`.
- Normalize and store as `+234XXXXXXXXXX` always.
- Reject anything else.
- Use a `normalizeNigerianPhone(input: string)`
  helper.

### Zod schema example

```ts
const nigerianPhoneSchema = z
  .string()
  .regex(/^(\+234|0)[789][01]\d{8}$/, 'Invalid Nigerian phone number')
  .transform(normalizeNigerianPhone);
```

## States and Cities

Nigeria has 36 states plus the FCT (Federal Capital
Territory, Abuja).

### MVP Scope

- Launch in **Lagos only**.
- Lagos has many areas; do not require area selection.
  A free-text address field is enough.

### Phase 2 States (planned)

Abuja (FCT), Rivers (Port Harcourt), Oyo (Ibadan),
Kano, Kaduna, Enugu, Anambra, Delta, Edo, Ogun.

### Lagos Areas (for vendor address context)

Common areas vendors operate in: Ikeja, Victoria
Island, Lekki, Ikoyi, Surulere, Yaba, Ajah, Magodo,
Gbagada, Maryland, Festac, Apapa, Mainland (general),
Island (general).

## Business Registration

### CAC

- CAC = Corporate Affairs Commission. The federal
  body that registers businesses in Nigeria.
- A registered business has an RC number for limited
  companies or a BN number for business names.
- Format: `RC1234567` or `BN1234567` (RC + digits, BN + digits).
- Numbers vary in length (5–8 digits typically).

### Validation

- Accept `RC` or `BN` prefix.
- Validate format with regex; do not call CAC API
  for verification in MVP (manual admin check is
  sufficient).
- Field is optional. Vendors without CAC get a
  "Verified Individual" badge instead of
  "Verified Business" after admin verification.

```ts
const cacSchema = z
  .string()
  .regex(/^(RC|BN)\d{4,9}$/i, 'Invalid CAC number')
  .transform(s => s.toUpperCase())
  .optional();
```

## Banking

- Nigerian bank account numbers are 10 digits.
- Major banks: GTBank, Access, Zenith, UBA, First Bank,
  Stanbic IBTC, FCMB, Fidelity, Union, Wema, Sterling,
  Polaris, Keystone, Ecobank, Heritage, Providus,
  Citibank, Standard Chartered, plus digital banks:
  Kuda, Opay, PalmPay, Carbon, VBank, Sparkle, Mint.

### Paystack Bank Resolution

- Paystack has a `/bank` endpoint that returns all
  supported banks with their codes.
- Cache the list daily. Do not fetch on every form load.
- Use Paystack's `/bank/resolve` endpoint to verify
  an account number returns the correct account name
  before saving. This is a sanity check, not a
  security measure.

```ts
// Resolve account before saving vendor bank details
GET https://api.paystack.co/bank/resolve?account_number=XXX&bank_code=XXX
```

## Names

- Nigerian full names often have 3+ parts (e.g.
  "Adebayo Olamide Johnson", "Chinwe Ifeoma Okonkwo").
- Yoruba names commonly start with "Olu-", "Ade-",
  "Ola-", "Oluwa-".
- Igbo names commonly start with "Chi-", "Nna-", "Eze-".
- Hausa/Fulani names often include "Mohammed", "Aisha",
  "Ibrahim", "Hauwa".
- Do not split into first/last name fields with strict
  validation — use a single `fullName` field.
- Display "Sender: Olamide A." style (truncate middle
  names) for compact UI; full name for formal contexts.

## Dates and Time

- Time zone: West Africa Time (WAT), UTC+1, no DST.
- Display dates in `D MMM YYYY` format
  (e.g. "15 March 2026") — clearer than US `MM/DD`
  or ISO `YYYY-MM-DD` for non-technical users.
- Use `date-fns` with `Africa/Lagos` time zone for
  display.
- Store all timestamps as UTC in the database.

## Event Types and Context

Nigerian events that drive vendor bookings:

- **Weddings**: traditional (engagement, intro,
  trad wedding) + white wedding. Multi-day affair.
  Highest spend category.
- **Naming ceremonies**: 8 days after birth in some
  traditions. Catering and decoration heavy.
- **Owambe**: general term for big celebratory events
  (birthdays, anniversaries, housewarmings). High
  energy, often with DJ + MC + caterer.
- **Burials / funerals**: significant cultural events,
  not somber-only. Often include catering and
  decoration.
- **Birthday parties**: especially 30th, 40th, 50th,
  60th, 70th. Big milestones.
- **Corporate events**: end-of-year parties,
  product launches, awards.

This context informs:
- Service descriptions (offer "Traditional Wedding"
  packages, not just "Wedding").
- Search filters and category labels.
- Image gallery curation.

## Communication Norms

- **WhatsApp is dominant.** Almost every business
  in Nigeria has a WhatsApp Business presence.
  Customers expect WhatsApp contact.
- **Instagram for portfolio.** Vendors maintain
  visual portfolios on Instagram far more than
  on websites. Linking to a vendor's Instagram
  is a strong trust signal.
- **Phone calls happen.** Especially for high-value
  bookings, customers may want to call before
  paying a deposit.
- **Email is less common** for consumer interactions.
  Use email for receipts, contracts, and admin
  communication. Use WhatsApp/SMS for time-sensitive
  customer-facing notifications when possible.

## Trust Signals

In order of customer-perceived importance:

1. CAC registration ("Verified Business" badge).
2. Verified admin badge ("checked by our team").
3. Active Instagram presence with portfolio.
4. On-platform reviews from completed bookings.
5. Years of experience.
6. Escrow protection messaging ("Your money is
   held safely until your event is done").
7. Phone/WhatsApp number visible (post-deposit).

## Common Pitfalls to Avoid

- **Don't assume US/UK conventions.** Phone formats,
  address formats, date formats, and currency
  formatting are all different.
- **Don't require state + city + zip code.** Nigerian
  addresses don't use zip codes commonly. State +
  free-text address is enough.
- **Don't require CAC.** Many real, legitimate vendors
  operate without formal registration, especially in
  catering and decoration.
- **Don't force email-only communication.** Build
  flexibility for WhatsApp coordination.
- **Don't show prices without currency.** Always
  show "₦" prefix. Showing "5,000" alone is
  ambiguous (could be misread as $5,000).
- **Don't internationalize the time zone.** WAT is
  fine. Most users won't care about other zones.

## Sample Vendor Personas

For seed data and design references:

1. **Folake (Caterer)** — Runs "Folake's Kitchen"
   from her home in Surulere. Caters 2-3 events per
   week. 8 years experience. No CAC, but excellent
   Instagram and reviews. Verified Individual.

2. **Tunde (Photographer)** — "Tunde Lens Studio."
   CAC registered. Specializes in wedding photography.
   Shoots 50+ weddings a year. ₦400k starting price.
   Verified Business.

3. **House of Lush (Decoration)** — A 3-person
   team operating from a Lekki studio. CAC registered.
   Specializes in luxury weddings and corporate events.
   ₦800k-₦3m per event. Verified Business.

## Tone of Voice

When writing customer-facing copy:

- Warm, confident, direct. Not formal-stiff.
- Pidgin and casual English are okay in marketing
  copy (sparingly), but transactional UI is
  standard English.
- Avoid US idioms ("crushing it", "killer deal").
- Avoid UK formality that feels distant.
- Examples of good tone:
  - "Your event, in trusted hands."
  - "Verified vendors. Real reviews. Your money held safe."
  - "Book the right vendor, the first time."
