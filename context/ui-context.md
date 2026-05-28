# UI Context

## Theme

EventIQ supports both light and dark modes via
`next-themes`. The user can toggle modes and the choice
persists. System preference is respected on first visit.

The visual language draws from Nigerian celebratory
culture without falling into cliché. The light theme
evokes a clean, premium event invitation — warm cream
backgrounds, deep ink text, and a single accent color
that carries energy. The dark theme is a sophisticated
evening event — deep charcoal, soft amber accents, with
warm undertones that distinguish it from generic SaaS
dark themes.

Every component must work in both modes. Use semantic
tokens, not direct shades.

## Color System

Colors are defined as CSS custom properties on `:root`
(light) and `.dark` (dark). Tailwind references them
via the `theme.extend.colors` configuration mapping
to `hsl(var(--token))`.

### Semantic Tokens

| Role               | CSS Variable          | Light                  | Dark                   |
| ------------------ | --------------------- | ---------------------- | ---------------------- |
| Page background    | `--background`        | `40 33% 97%` (cream)   | `20 14% 8%` (charcoal) |
| Surface (card)     | `--card`              | `0 0% 100%` (white)    | `20 12% 11%`           |
| Surface elevated   | `--surface-elevated`  | `40 30% 94%`           | `20 10% 14%`           |
| Primary text       | `--foreground`        | `20 14% 12%`           | `40 20% 95%`           |
| Muted text         | `--muted-foreground`  | `20 8% 40%`            | `40 8% 65%`            |
| Accent (primary)   | `--primary`           | `18 88% 48%` (terra)   | `28 92% 58%` (amber)   |
| Accent foreground  | `--primary-foreground`| `40 30% 98%`           | `20 14% 8%`            |
| Secondary accent   | `--secondary`         | `155 35% 28%` (jade)   | `155 30% 50%`          |
| Border             | `--border`            | `30 15% 88%`           | `20 8% 20%`            |
| Input border       | `--input`             | `30 15% 85%`           | `20 8% 22%`            |
| Ring (focus)       | `--ring`              | `18 88% 48%`           | `28 92% 58%`           |
| Muted surface      | `--muted`             | `40 20% 92%`           | `20 8% 16%`            |
| Destructive        | `--destructive`       | `0 75% 50%`            | `0 70% 55%`            |
| Success            | `--success`           | `145 60% 38%`          | `145 55% 50%`          |
| Warning            | `--warning`           | `38 92% 50%`           | `38 88% 58%`           |
| Verified badge     | `--verified`          | `200 80% 42%`          | `200 75% 60%`          |

### Color Philosophy

- **Terracotta primary** in light mode references Nigerian
  earthenware and adire dye. **Amber primary** in dark mode
  references oil lamps and gold jewelry. Both feel warm
  and celebratory without being a generic SaaS purple
  or blue.
- **Jade secondary** is used sparingly — for success
  states, "verified" trust signals, and selected states.
  It pairs warmly with terracotta without competing.
- **No purple gradients.** No blue primary. No grey
  primary buttons.
- Accent colors carry weight; the background and text
  stay quiet. Sharp accent, calm canvas.

## Typography

Two fonts are loaded via `next/font/google`:

| Role         | Font                | CSS Variable | Weights         |
| ------------ | ------------------- | ------------ | --------------- |
| Display      | Fraunces            | `--font-display` | 400, 600, 900 |
| Body/UI      | Plus Jakarta Sans   | `--font-sans`    | 400, 500, 600, 700 |

### Why these fonts

- **Fraunces** is a contemporary serif with optical
  sizing and a slight warmth. Used for headlines, hero
  titles, and vendor names. Avoids the generic "Inter
  everywhere" SaaS look. Pairs well with celebratory
  context.
- **Plus Jakarta Sans** is a clean, slightly humanist
  geometric sans with excellent legibility at small
  sizes. Used for body text, UI labels, and buttons.

Display sizes use Fraunces with `font-feature-settings:
"opsz" auto` for optical sizing. Tracking on large
display text is tightened (`tracking-tight` or
`tracking-tighter`).

### Type Scale

| Use            | Class                                    | Font     |
| -------------- | ---------------------------------------- | -------- |
| Hero display   | `text-5xl md:text-7xl font-display font-black tracking-tighter` | Fraunces |
| Page title     | `text-3xl md:text-4xl font-display font-semibold tracking-tight` | Fraunces |
| Section title  | `text-2xl font-display font-semibold`    | Fraunces |
| Card title     | `text-lg font-semibold`                  | Jakarta  |
| Body           | `text-base`                              | Jakarta  |
| Small / caption| `text-sm text-muted-foreground`          | Jakarta  |
| Label          | `text-xs font-medium uppercase tracking-wider` | Jakarta |

## Border Radius

| Context                    | Class           | Variable      |
| -------------------------- | --------------- | ------------- |
| Inline elements, badges    | `rounded-md`    | `--radius-sm` |
| Buttons, inputs            | `rounded-lg`    | `--radius`    |
| Cards, panels              | `rounded-2xl`   | `--radius-lg` |
| Modals, sheets             | `rounded-3xl`   | `--radius-xl` |
| Avatars, circular elements | `rounded-full`  | —             |

Set `--radius: 0.625rem` (10px) as the base. Other
radii derive from it.

## Spacing and Layout

- Use Tailwind's spacing scale. Avoid arbitrary values
  except for one-off design needs.
- Container max widths:
  - Marketing pages: `max-w-7xl`
  - Dashboard pages: `max-w-screen-2xl`
  - Forms: `max-w-2xl`
  - Reading content: `max-w-prose`
- Vertical rhythm: section padding `py-16 md:py-24`
  on marketing; `py-6` on dashboard pages.
- Grid gaps: `gap-4` for cards in tight grids,
  `gap-6` for spacious grids, `gap-8` for sections.

## Component Library

shadcn/ui on top of Tailwind. Components are installed
via the CLI and live in `components/ui/`. Customize by
modifying the generated files, not by wrapping.

Required components for MVP:
`button`, `input`, `textarea`, `select`, `checkbox`,
`radio-group`, `label`, `form`, `card`, `badge`,
`avatar`, `dialog`, `sheet`, `dropdown-menu`, `tabs`,
`table`, `toast` (Sonner), `skeleton`, `separator`,
`tooltip`, `popover`, `calendar`, `command`.

Custom components built on top (in `components/`):
`VendorCard`, `BookingStatusBadge`, `PriceDisplay`,
`VerifiedBadge`, `EmptyState`, `PageHeader`,
`StepIndicator`, `PortfolioGallery`.

## Layout Patterns

### Public Marketing Layout

- Sticky top nav with logo left, links center, auth
  CTAs right. Transparent over hero, becomes solid
  on scroll (with backdrop blur).
- Footer with three columns: links, contact, social.
  Naira disclaimer and CAC RC number in bottom bar.

### Customer Dashboard Layout

- Top bar with logo, search, notifications, avatar
  menu.
- Left sidebar (collapsible on mobile): My Bookings,
  Reviews, Profile.
- Main content area with `PageHeader` at top.

### Vendor Dashboard Layout

- Same shell as customer dashboard, different sidebar
  items: Services, Bookings, Portfolio, Earnings,
  Reviews, Verification, Settings.
- Verification status banner at top if not yet verified.

### Admin Layout

- Different visual treatment — slightly different
  accent (use `--secondary` for admin chrome) to
  make it obvious you are in an admin view.
- Sidebar: Verifications, Users, Disputes, Reports,
  Analytics.

### Modals and Sheets

- Use `Dialog` for confirmations and short forms.
- Use `Sheet` (right-side) for longer forms and
  detail views on mobile.
- Backdrop: `backdrop-blur-sm` with
  `bg-background/80`.

## Motion

Use Framer Motion (`motion` package) for orchestrated
animations. CSS transitions for simple hover and focus
states.

### Principles

- One coordinated entry per page beats many scattered
  micro-interactions.
- Stagger animations on lists (cards, search results)
  with `delay` increments of 50ms.
- Use `prefers-reduced-motion` to disable non-essential
  motion.
- Durations: 150ms (micro), 250ms (standard), 400ms
  (page-level), 600ms+ (hero, special moments).
- Easing: `[0.32, 0.72, 0, 1]` (custom ease-out) for
  most transitions. Avoid the default ease.

### Standard Patterns

- Page load: title fades up with slight rise (y: 12px
  → 0), then content staggered below.
- Card hover: subtle lift (`translateY(-2px)`) with
  shadow grow. 200ms.
- Modal open: scale from 0.96 to 1 with opacity fade,
  250ms.
- Toast: slide in from bottom-right (desktop) or
  top (mobile).

## Icons

Lucide React. Stroke-based, 1.5px stroke weight.

| Size                  | Class       |
| --------------------- | ----------- |
| Inline (in text)      | `h-4 w-4`   |
| Button icon           | `h-4 w-4`   |
| Standalone UI         | `h-5 w-5`   |
| Section heading icon  | `h-6 w-6`   |
| Empty state icon      | `h-12 w-12` |

Never mix icon libraries. If a needed icon does not
exist in Lucide, use an inline SVG and match the
stroke weight.

## Imagery

- Vendor portfolio images served via Cloudinary with
  responsive transformations (`w_auto,f_auto,q_auto`).
- Hero images on marketing pages use Cloudinary
  transformations for blur-up placeholders.
- Aspect ratios: vendor cards `4:5`, portfolio grid
  `1:1` with one `2:1` feature, hero `16:9`.
- No stock photos with white American couples in
  wedding attire. Source from Nigerian event
  photography or commission. Until then, use
  placeholder cards with category illustrations.

## Forms

- Use `react-hook-form` + Zod via shadcn's `Form`
  primitives.
- Labels above inputs, never inside (placeholder is
  hint, not label).
- Required fields marked with an asterisk in the
  primary color.
- Error messages below input, in destructive color,
  `text-sm`.
- Submit button at bottom right of form, disabled
  while submitting with a spinner.
- Multi-step forms (booking, vendor onboarding) use
  the `StepIndicator` component at top.

## Empty States

Every list view has a designed empty state with:
- An illustration or icon (`h-12 w-12 text-muted-foreground`).
- A heading explaining what's empty.
- One sentence of context.
- A primary action button when applicable.

Never ship a list view that shows a blank screen
when empty.

## Loading States

- Use shadcn `Skeleton` for content placeholders.
  Skeletons should match the shape of the content
  they replace.
- Buttons show a spinner inline (not a separate state)
  during submission.
- Page-level loading uses `loading.tsx` route file
  with a skeleton matching the page layout.
- Never use generic spinners centered on empty pages.
  Always shape-match.

## Accessibility

- All interactive elements reachable by keyboard.
- Focus rings visible (`focus-visible:ring-2
  focus-visible:ring-ring`).
- Color contrast meets WCAG AA: 4.5:1 for body,
  3:1 for large text.
- Form inputs have associated labels.
- Icons that convey meaning have `aria-label` or
  accompanying text.
- Modal traps focus and restores it on close.
