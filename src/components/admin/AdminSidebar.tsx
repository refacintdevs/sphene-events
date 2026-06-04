import Link from "next/link";
import {
  ShieldCheck,
  Users,
  AlertTriangle,
  Wallet,
  ScrollText,
  LayoutDashboard,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, active: true },
  { href: "/admin/verifications", label: "Verifications", icon: ShieldCheck, active: true },
  { href: "#", label: "Users", icon: Users, active: false },
  { href: "#", label: "Disputes", icon: AlertTriangle, active: false },
  { href: "#", label: "Payouts", icon: Wallet, active: false },
  { href: "#", label: "Audit Log", icon: ScrollText, active: false },
];

export function AdminSidebar() {
  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-secondary/5 md:flex">
      <div className="flex h-14 items-center border-b border-border px-5">
        <span className="font-display text-base font-semibold text-secondary">
          Admin
        </span>
      </div>
      <nav className="flex-1 space-y-0.5 p-3" aria-label="Admin navigation">
        {NAV_ITEMS.map(({ href, label, icon: Icon, active }) =>
          active ? (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/15 hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          ) : (
            <span
              key={label}
              className="flex cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground opacity-50"
              title="Coming soon"
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {label}
            </span>
          ),
        )}
      </nav>
    </aside>
  );
}
