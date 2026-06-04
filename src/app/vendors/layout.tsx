import type { ReactNode } from "react";
import { SiteNav } from "@/components/nav/SiteNav";
import { FooterSection } from "@/components/landing/FooterSection";

export default function VendorsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteNav />
      {children}
      <FooterSection />
    </>
  );
}
