"use client";

import Link from "next/link";
import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminPanelShell({
  children,
  pendingSellerCount,
}: {
  children: React.ReactNode;
  pendingSellerCount: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f4f3f0] px-2 py-2 text-stone-900 sm:px-3 sm:py-3 md:px-5 md:py-5">
      <div className="mx-auto w-full max-w-[1380px] rounded-3xl border border-[#e5e2db] bg-[#fafaf8] p-2.5 sm:p-3 md:p-4">
        <div className="flex items-center justify-between rounded-2xl border border-[#ece7de] bg-white p-2.5 lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="rounded-xl border border-[#e3ddd3] px-3 py-2 text-xs font-medium text-stone-700"
          >
            Menu
          </button>
          <p className="text-sm font-semibold text-stone-900">Zivia Admin</p>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f0ece4] text-[11px] font-semibold text-stone-700">
            ZA
          </span>
        </div>

        <div className="mt-2 flex gap-4 lg:mt-0">
          <div className="hidden lg:block">
            <AdminSidebar pendingSellerCount={pendingSellerCount} />
          </div>

          <section className="min-w-0 flex-1">
            <div className="mb-3 rounded-2xl border border-[#ece7de] bg-white p-3 sm:p-3.5 md:mb-4 md:p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                <div className="relative w-full max-w-xl">
                  <input
                    readOnly
                    value=""
                    placeholder="Məhsul, satıcı və ya sifariş axtar..."
                    className="h-11 w-full rounded-xl border border-[#e3ddd3] bg-[#fbfbfa] px-4 text-sm text-stone-600 outline-none"
                  />
                  <span className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-lg border border-[#dfd8cd] bg-white px-2 py-0.5 text-[11px] text-stone-500 sm:block">
                    Cmd+K
                  </span>
                </div>
                <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
                  <Link
                    href="/admin/sellers"
                    className="rounded-xl border border-[#e3ddd3] px-3 py-2 text-xs text-stone-600 hover:bg-stone-50"
                  >
                    Bildirişlər{pendingSellerCount > 0 ? ` (${pendingSellerCount})` : ""}
                  </Link>
                  <Link
                    href="/admin/settings"
                    className="rounded-xl border border-[#e3ddd3] px-3 py-2 text-xs text-stone-600 hover:bg-stone-50"
                  >
                    Profil
                  </Link>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#ece7de] bg-white p-3 sm:p-3.5 md:p-5">{children}</div>
          </section>
        </div>
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/35"
            aria-label="Close menu overlay"
          />
          <div className="absolute left-2 top-2 h-[calc(100dvh-1rem)] w-[84%] max-w-[320px]">
            <AdminSidebar pendingSellerCount={pendingSellerCount} onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
