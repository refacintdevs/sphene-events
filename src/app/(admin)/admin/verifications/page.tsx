import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, Clock } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { getPendingVendors } from "@/services/admin";

export const metadata: Metadata = {
  title: "Verifications — EventIQ Admin",
};

export default async function VerificationsPage() {
  const vendors = await getPendingVendors();

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          Verifications
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {vendors.length === 0
            ? "No pending submissions."
            : `${vendors.length} submission${vendors.length !== 1 ? "s" : ""} awaiting review.`}
        </p>
      </div>

      {vendors.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-12 w-12" aria-hidden="true" />}
          heading="Queue is clear"
          description="All vendor submissions have been reviewed. New submissions will appear here."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Business
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground sm:table-cell">
                  Category
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground md:table-cell">
                  City
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Submitted
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Age
                </th>
                <th className="px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {vendors.map((vendor) => (
                <VendorRow key={vendor.id} vendor={vendor} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function VendorRow({
  vendor,
}: {
  vendor: {
    id: string;
    businessName: string;
    city: string;
    primaryCategory: string | null;
    createdAt: Date;
  };
}) {
  const hoursInQueue = Math.floor(
    (Date.now() - vendor.createdAt.getTime()) / (1000 * 60 * 60),
  );
  const isAgingOut = hoursInQueue >= 48;

  const submittedDate = vendor.createdAt.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const ageLabel =
    hoursInQueue < 1
      ? "< 1h"
      : hoursInQueue < 24
        ? `${hoursInQueue}h`
        : `${Math.floor(hoursInQueue / 24)}d ${hoursInQueue % 24}h`;

  return (
    <tr className="transition-colors hover:bg-muted/30">
      <td className="px-4 py-3 font-medium text-foreground">
        {vendor.businessName}
      </td>
      <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
        {vendor.primaryCategory
          ? vendor.primaryCategory.charAt(0) +
            vendor.primaryCategory.slice(1).toLowerCase()
          : "—"}
      </td>
      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
        {vendor.city}
      </td>
      <td className="px-4 py-3 text-muted-foreground">{submittedDate}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium ${
            isAgingOut ? "text-destructive" : "text-muted-foreground"
          }`}
          title={isAgingOut ? "SLA at risk — over 48h in queue" : undefined}
        >
          <Clock className="h-3 w-3" aria-hidden="true" />
          {ageLabel}
          {isAgingOut && " ⚠"}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          href={`/admin/verifications/${vendor.id}`}
          className="text-xs font-medium text-secondary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Review
        </Link>
      </td>
    </tr>
  );
}
