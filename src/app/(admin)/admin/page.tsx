import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Building2, CheckCircle } from "lucide-react";
import { getAdminOverviewStats } from "@/services/admin";

export const metadata: Metadata = {
  title: "Admin Overview — EventIQ",
};

export default async function AdminOverviewPage() {
  const { pendingCount, totalVendors, approvedCount } =
    await getAdminOverviewStats();

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          Overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform health at a glance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Pending verifications"
          value={pendingCount}
          icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
          href="/admin/verifications"
          urgent={pendingCount > 0}
        />
        <StatCard
          label="Total vendors"
          value={totalVendors}
          icon={<Building2 className="h-5 w-5" aria-hidden="true" />}
        />
        <StatCard
          label="Approved vendors"
          value={approvedCount}
          icon={<CheckCircle className="h-5 w-5" aria-hidden="true" />}
        />
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        Full analytics dashboard — coming Phase 2.
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  href,
  urgent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  href?: string;
  urgent?: boolean;
}) {
  const content = (
    <div
      className={`rounded-2xl border p-5 ${
        urgent
          ? "border-secondary/40 bg-secondary/10"
          : "border-border bg-card"
      }`}
    >
      <div
        className={`mb-3 ${urgent ? "text-secondary" : "text-muted-foreground"}`}
      >
        {icon}
      </div>
      <p className="font-display text-3xl font-semibold text-foreground">
        {value}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl">
        {content}
      </Link>
    );
  }
  return content;
}
