import type { Metadata } from "next";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { SellerContentPolicyNotice } from "@/components/dashboard/SellerContentPolicyNotice";

export const metadata: Metadata = {
  title: "Satıcı paneli",
  description: "Zivia satıcı idarəetmə paneli.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--zivia-warm-white)] via-white to-[var(--zivia-cream)]">
      <div className="border-b border-amber-100/80 bg-white/90 shadow-sm backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-800/90">
            Satıcı paneli
          </p>
          <div className="mt-2">
            <DashboardNav />
          </div>
        </div>
      </div>
      {children}
      <SellerContentPolicyNotice />
    </div>
  );
}
