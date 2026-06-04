# EventIQ — Manual Test Cases: Unit 1.2 (Vendors Browse)

This file records manual test cases executed against the `/vendors`
browse page (Phase 1, Unit 1.2). It is maintained as a dissertation
artifact for Chapter 4 Requirement 9 (testing evidence). Automated
unit tests are introduced separately in Unit 4.1; the cases below are
manual verification of behaviour that the build process cannot assert.

**How to run:** start the dev server with the env wrapper, then work
top to bottom. Record the observed result in the *Actual* column and
mark *Status* PASS / FAIL. A FAIL becomes a row in `docs/bug-log.md`.

```
npx dotenv -e .env.local -- npm run dev
# inspect data alongside testing:
npx dotenv -e .env.local -- npx prisma studio
```

**Environment:** local dev, seed data as of Unit 1.1 (3 vendors, 6
services, 12 portfolio items, 1 booking PAID, 0 reviews).

Date executed: ____________  Tester: ____________

## Access & Routing

| ID | Area | Steps | Expected Result | Actual | Status |
|----|------|-------|-----------------|--------|--------|
| TC-1.2-01 | Access (anon) | Open `/vendors` in a private/incognito window with no Clerk session. | Page renders the vendor grid. No redirect to `/sign-in`. Confirms the `/vendors(.*)` public matcher in `proxy.ts` is correct. | | |
| TC-1.2-02 | Access (auth) | Open `/vendors` while signed in. | Page renders identically; no role gate interferes. | | |
| TC-1.2-03 | Route type | Observe build output / network. | `/vendors` is server-rendered dynamic (reads searchParams); no client-side data fetch for the grid. | | |

## Hero Handoff

| ID | Area | Steps | Expected Result | Actual | Status |
|----|------|-------|-----------------|--------|--------|
| TC-1.2-04 | Hero → browse | From `/`, submit the landing search box with a category selected. | Lands on `/vendors` with the category pre-applied and matching results shown — NOT an empty grid. | | |
| TC-1.2-05 | Category casing | Inspect the URL the hero produces. | Category value matches the enum (`CATERING`), not lowercase/display (`catering`). If mismatched, the per-field `.catch()` silently drops it and the filter no-ops. | | |
| TC-1.2-06 | Free-text q | Submit a `q` value matching part of a seeded business name (e.g. "Folake"). | Results filter to matching vendor(s) on businessName/bio, case-insensitive. | | |

## Filters — Correctness

| ID | Area | Steps | Expected Result | Actual | Status |
|----|------|-------|-----------------|--------|--------|
| TC-1.2-07 | Category single | Check one category (e.g. CATERING) only. | Only vendors with an active service in that category appear. | | |
| TC-1.2-08 | Category multi | Check two categories. | URL shows `category=CATERING,PHOTOGRAPHY`; results are the union. | | |
| TC-1.2-09 | Price band low | Select "under ₦50k". | Only vendors whose STARTING price (min active service) is `<5_000_000` kobo appear. Cross-check an excluded vendor in Prisma Studio. | | |
| TC-1.2-10 | Price band mid | Select "₦50k–₦200k". | Starting price in `5_000_000 ..< 20_000_000` kobo. Verify band edges (off-by-one risk in app-side kobo thresholds). | | |
| TC-1.2-11 | Price band high | Select "over ₦200k". | Starting price `>=20_000_000` kobo. | | |
| TC-1.2-12 | Date exclusion | Pick a date on which a seeded booking exists in PAID/ACCEPTED. | The vendor tied to that booking drops out of results. (Weak with current seed — revisit after Unit 1.5.) | | |
| TC-1.2-13 | City | Inspect the city select. | Lagos shown, control disabled (axis visible, no behaviour). | | |
| TC-1.2-14 | Verified chip | Inspect results header. | Static "All vendors verified" trust chip present; no verified-only toggle exists. | | |

## Sort

| ID | Area | Steps | Expected Result | Actual | Status |
|----|------|-------|-----------------|--------|--------|
| TC-1.2-15 | Recommended | Default sort, no `sort` param. | Rated vendors first (avgRating desc, nulls last), then createdAt desc. (All null until reviews exist — verify tiebreak by createdAt.) | | |
| TC-1.2-16 | Price asc | `sort=price_asc`. | Ascending by starting price. | | |
| TC-1.2-17 | Price desc | `sort=price_desc`. | Descending by starting price. | | |
| TC-1.2-18 | Rating | `sort=rating`. | By avgRating desc. (Flat until reviews exist.) | | |
| TC-1.2-19 | Newest | `sort=newest`. | By createdAt desc. | | |

## Pagination

| ID | Area | Steps | Expected Result | Actual | Status |
|----|------|-------|-----------------|--------|--------|
| TC-1.2-20 | Count | Load `/vendors` unfiltered. | Total vendor count displayed and accurate vs seed. | | |
| TC-1.2-21 | Prev/Next | If >20 results exist, click Next then Prev. | Navigation works via `<Link>` without JS; correct slice each page. (May be untestable until seed grows in 1.5.) | | |
| TC-1.2-22 | Over-range | Visit `/vendors?page=999`. | Clamps to empty state. No crash, no negative-`skip` Prisma error. | | |

## Input Degradation (Zod per-field `.catch()`)

| ID | Area | Steps | Expected Result | Actual | Status |
|----|------|-------|-----------------|--------|--------|
| TC-1.2-23 | Bad category | `/vendors?category=GARBAGE`. | Falls back to all categories; no error. | | |
| TC-1.2-24 | Bad price/sort | `/vendors?price=banana&sort=nonsense`. | Both fall back to defaults; page renders normally. | | |
| TC-1.2-25 | Bad date | `/vendors?date=not-a-date`. | Date filter ignored; no crash. | | |
| TC-1.2-26 | Mixed junk | Combine several invalid params. | Page degrades gracefully to defaults across all fields. | | |

## Empty State

| ID | Area | Steps | Expected Result | Actual | Status |
|----|------|-------|-----------------|--------|--------|
| TC-1.2-27 | No results | Over-filter (e.g. a `q` matching nothing). | `EmptyState` shows: heading, one line of context, and a "Clear filters" action linking to bare `/vendors`. | | |
| TC-1.2-28 | Clear filters | From the empty state, click "Clear filters". | Returns to `/vendors` with all filters reset and full results. | | |

## Card Rendering

| ID | Area | Steps | Expected Result | Actual | Status |
|----|------|-------|-----------------|--------|--------|
| TC-1.2-29 | "New" chip | View any card (all have 0 reviews currently). | EVERY card shows the "New" chip, not an empty star row. An empty star row on any card is a bug. | | |
| TC-1.2-30 | Card data | Inspect a card. | Business name, category, city, starting price (formatted ₦ with separators), verified badge all correct vs Prisma Studio. | | |

## Responsive & Theme

| ID | Area | Steps | Expected Result | Actual | Status |
|----|------|-------|-----------------|--------|--------|
| TC-1.2-31 | Light/dark | Toggle theme on `/vendors`. | All surfaces, text, chips, badges use semantic tokens; both modes legible; no hardcoded colors bleed through. | | |
| TC-1.2-32 | Mobile 375px | DevTools device toolbar at 375px. | Sidebar collapses; cards don't overflow; layout intact. | | |
| TC-1.2-33 | Mobile filter sheet | At 375px, open the filter sheet, set a filter, submit. | Sheet OPENS (BUG-003 regression check — uncontrolled Sheet), filter applies, results update. | | |
| TC-1.2-34 | Loading skeleton | Throttle network / hard refresh. | `loading.tsx` shows shape-matched skeleton (≈6 cards + sidebar), not a generic centered spinner. | | |

---

**Notes**

- TC-1.2-12 and TC-1.2-21 are weakly exercisable on current seed
  (single booking, <20 vendors). They are listed for completeness and
  should be re-run after Unit 1.5 expands seed data. Note this
  limitation in Chapter 4 rather than claiming full coverage.
- Any FAIL row should be transcribed into `docs/bug-log.md` with full
  root-cause/fix detail while the context is fresh (same discipline as
  Unit 1.0).