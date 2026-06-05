import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { findCurrentUser } from "@/lib/auth";
import { getVendorProfileByUserId } from "@/services/vendor-onboarding";
import { OnboardingForm } from "./_components/OnboardingForm";
import { UnderReview } from "./_components/UnderReview";

export const metadata: Metadata = {
  title: "Vendor Onboarding — EventIQ",
};

export default async function VendorOnboardingPage() {
  // findCurrentUser() — read-only, no ensureUser() side effect (AD-010).
  // Layout already verified role = VENDOR, but user can be null if auth
  // state changed between layout render and this render.
  const user = await findCurrentUser();
  if (!user) redirect("/sign-in");

  const profile = await getVendorProfileByUserId(user.id);

  // No profile yet, or vendor started but never submitted — show fresh form.
  if (!profile || profile.verificationStatus === "UNSUBMITTED") {
    return <OnboardingForm />;
  }

  // Submission received; waiting for admin decision.
  if (profile.verificationStatus === "PENDING") {
    return <UnderReview />;
  }

  // Approved — send to homepage until vendor dashboard is built.
  // TODO(Unit 2.4): replace redirect('/') with redirect('/vendor/dashboard')
  if (profile.verificationStatus === "APPROVED") {
    redirect("/");
  }

  // REJECTED or INFO_REQUESTED — show the form pre-filled with profile data.
  // File uploads (gov ID, CAC cert, portfolio) cannot be pre-filled here;
  // the vendor must re-upload them. This is noted in vendor-onboarding.ts.
  return (
    <OnboardingForm
      prefill={{
        businessName:      profile.businessName,
        bio:               profile.bio,
        yearsOfExperience: String(profile.yearsOfExperience),
        primaryCategory:   profile.primaryCategory ?? "",
        address:           profile.address,
        whatsappNumber:    profile.whatsappNumber,
        instagramHandle:   profile.instagramHandle ?? "",
        cacNumber:         profile.cacNumber ?? "",
        bankName:          profile.bankName ?? "",
        bankAccountNumber: profile.bankAccountNumber ?? "",
        bankAccountName:   profile.bankAccountName ?? "",
      }}
      adminNote={profile.verificationNotes}
    />
  );
}
