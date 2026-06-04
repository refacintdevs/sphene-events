import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronLeft, FileText } from "lucide-react";
import { VerifyActionButtons } from "@/components/admin/VerifyActionButtons";
import { VerifiedBadge } from "@/components/vendor/VerifiedBadge";
import { getVendorSubmission } from "@/services/admin";
import { formatNaira } from "@/lib/format";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const vendor = await getVendorSubmission(id);
  if (!vendor) return { title: "Not Found — EventIQ Admin" };
  return { title: `${vendor.businessName} — Verifications — EventIQ Admin` };
}

export default async function VerificationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const vendor = await getVendorSubmission(id);
  if (!vendor) notFound();

  const statusLabel: Record<string, string> = {
    PENDING: "Pending Review",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    INFO_REQUESTED: "Info Requested",
    UNSUBMITTED: "Unsubmitted",
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Back link */}
      <Link
        href="/admin/verifications"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back to queue
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            {vendor.businessName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Submitted by {vendor.ownerName} ({vendor.ownerEmail}) ·{" "}
            {vendor.createdAt.toLocaleDateString("en-NG", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {statusLabel[vendor.verificationStatus] ?? vendor.verificationStatus}
          </span>
          <VerifiedBadge hasCac={Boolean(vendor.cacNumber)} />
        </div>
      </div>

      {/* Action buttons — only show for actionable statuses */}
      {(vendor.verificationStatus === "PENDING" ||
        vendor.verificationStatus === "INFO_REQUESTED") && (
        <section aria-labelledby="actions-heading">
          <h2
            id="actions-heading"
            className="mb-3 font-display text-lg font-semibold text-foreground"
          >
            Actions
          </h2>
          <VerifyActionButtons
            vendorId={vendor.id}
            businessName={vendor.businessName}
          />
          {vendor.verificationNotes && (
            <p className="mt-3 rounded-lg bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
              <span className="font-medium">Previous note:</span>{" "}
              {vendor.verificationNotes}
            </p>
          )}
        </section>
      )}

      {/* Business Info */}
      <Section title="Business Information">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Business name" value={vendor.businessName} />
          <Field label="City" value={vendor.city} />
          <Field label="Address" value={vendor.address} />
          <Field label="Years of experience" value={`${vendor.yearsOfExperience} years`} />
          <Field label="CAC number" value={vendor.cacNumber ?? "Not provided"} />
          <Field label="Instagram" value={vendor.instagramHandle ?? "Not provided"} />
          <Field label="WhatsApp" value={vendor.whatsappNumber} />
        </dl>
        <div className="mt-4">
          <dt className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Bio
          </dt>
          <p className="rounded-lg bg-muted/30 p-3 text-sm leading-relaxed text-foreground">
            {vendor.bio}
          </p>
        </div>
      </Section>

      {/* Bank Details */}
      <Section title="Bank Details">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Bank name" value={vendor.bankName ?? "Not provided"} />
          <Field label="Account number" value={vendor.bankAccountNumber ?? "Not provided"} />
          <Field label="Account name" value={vendor.bankAccountName ?? "Not provided"} />
        </dl>
      </Section>

      {/* Services */}
      <Section title="Services">
        {vendor.services.length === 0 ? (
          <p className="text-sm text-muted-foreground">No services listed yet.</p>
        ) : (
          <div className="space-y-2">
            {vendor.services.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5 text-sm"
              >
                <span className="font-medium text-foreground">{s.title}</span>
                <span className="text-muted-foreground">
                  {formatNaira(s.priceKobo)} ·{" "}
                  <span className="capitalize">
                    {s.category.charAt(0) + s.category.slice(1).toLowerCase()}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Documents */}
      <Section title="Verification Documents">
        {vendor.documents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-8 text-center">
            <FileText
              className="mx-auto mb-2 h-8 w-8 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-foreground">
              No documents uploaded yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Documents are uploaded during vendor onboarding (Unit 2.1).
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {vendor.documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5 text-sm"
              >
                <span className="font-medium text-foreground">{doc.fileName}</span>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  View
                </a>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Portfolio */}
      <Section title="Portfolio Samples">
        {vendor.portfolioItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">No portfolio images.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {vendor.portfolioItems.map((item, i) => (
              <div
                key={item.id}
                className="relative aspect-square overflow-hidden rounded-lg border border-border"
              >
                <Image
                  src={item.imageUrl}
                  alt={item.caption ?? `Portfolio image ${i + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
        {title}
      </h2>
      <div className="rounded-2xl border border-border bg-card p-5">
        {children}
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-foreground">{value}</dd>
    </div>
  );
}
