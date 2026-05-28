import Link from "next/link";

// All href values below point to pages that will be built in Phase 1.
// They correctly 404 until those routes exist — do not replace with "#".

const VENDOR_LINKS = [
  { label: "Join as a vendor", href: "/sign-up" },
  { label: "How verification works", href: "/for-vendors" },
  { label: "Vendor FAQ", href: "/for-vendors#faq" },
] as const;

const CUSTOMER_LINKS = [
  { label: "Browse vendors", href: "/vendors" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Escrow & safety", href: "/how-it-works#escrow" },
] as const;

const COMPANY_LINKS = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms of service", href: "/terms" },
] as const;

export function FooterSection() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-1">
              <span className="font-display text-lg font-black text-foreground">
                Event
              </span>
              <span className="font-display text-lg font-black text-primary">
                IQ
              </span>
            </div>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Verified event vendors. Trusted bookings. Real events.
            </p>
          </div>

          {/* For Vendors */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              For vendors
            </h4>
            <ul className="mt-4 space-y-2.5">
              {VENDOR_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Customers */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              For customers
            </h4>
            <ul className="mt-4 space-y-2.5">
              {CUSTOMER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Company
            </h4>
            <ul className="mt-4 space-y-2.5">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} EventIQ. All rights reserved.</p>
            <p className="text-xs text-muted-foreground/70">
              {/* RC number to be updated before public launch */}
              RC — (registration pending) · Naira payments processed securely via Paystack
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
