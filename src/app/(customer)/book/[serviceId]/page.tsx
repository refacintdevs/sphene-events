import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getServiceForBooking } from "@/services/booking";
import { formatNaira } from "@/lib/format";
import { BookingForm } from "./_components/BookingForm";

interface PageProps {
  params: Promise<{ serviceId: string }>;
}

/** YYYY-MM-DD for <input type="date"> min/max, using UTC to be consistent with Zod. */
function toDateInputStr(d: Date): string {
  return [
    d.getUTCFullYear(),
    String(d.getUTCMonth() + 1).padStart(2, "0"),
    String(d.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { serviceId } = await params;
  const service = await getServiceForBooking(serviceId);
  if (!service) return { title: "Book a Service — EventIQ" };
  return { title: `Book ${service.title} — EventIQ` };
}

export default async function BookServicePage({ params }: PageProps) {
  const { serviceId } = await params;
  const service = await getServiceForBooking(serviceId);

  if (!service || service.vendor.verificationStatus !== "APPROVED") notFound();

  // Price snapshot — computed server-side (invariant 2: prices never from client).
  const totalAmountKobo = service.priceKobo;
  const depositAmountKobo = Math.round(totalAmountKobo * 0.3);
  const balanceAmountKobo = totalAmountKobo - depositAmountKobo;

  const today = new Date();
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 18);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href={`/vendors/${service.vendor.slug}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back to {service.vendor.businessName}
      </Link>

      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
          Book a service
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill in your event details and we&apos;ll send your request to{" "}
          {service.vendor.businessName}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* ── Form (2/3 width on lg) ─────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <BookingForm
            serviceId={serviceId}
            serviceName={service.title}
            vendorName={service.vendor.businessName}
            totalAmountKobo={totalAmountKobo}
            depositAmountKobo={depositAmountKobo}
            balanceAmountKobo={balanceAmountKobo}
            minDate={toDateInputStr(today)}
            maxDate={toDateInputStr(maxDate)}
          />
        </div>

        {/* ── Service summary panel (1/3 width on lg, sticky) ───────────── */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Your booking
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Service
                </p>
                <p className="mt-0.5 font-medium text-foreground">
                  {service.title}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Vendor
                </p>
                <p className="mt-0.5 text-foreground">
                  {service.vendor.businessName}
                </p>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold text-foreground">
                  {formatNaira(totalAmountKobo)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Deposit (30%)</span>
                <span className="font-medium text-primary">
                  {formatNaira(depositAmountKobo)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Balance</span>
                <span className="text-foreground">
                  {formatNaira(balanceAmountKobo)}
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Deposit is due only after the vendor accepts your request. Funds
              are held in escrow until your event is complete.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
