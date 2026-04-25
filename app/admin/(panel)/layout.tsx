import Link from "next/link";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { requireAdminOrRedirect } from "@/lib/admin-guard";

export default async function AdminPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdminOrRedirect();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f4f3f0] px-3 py-3 text-stone-900 md:px-5 md:py-5">
      <div className="mx-auto w-full max-w-[1380px] rounded-[26px] border border-[#e5e2db] bg-[#fafaf8] p-3 md:p-4">
        <div className="flex flex-col gap-4 lg:flex-row">
          <AdminSidebar />

          <section className="min-w-0 flex-1">
            <div className="mb-4 rounded-2xl border border-[#ece7de] bg-white p-3.5 md:p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative w-full max-w-xl">
                  <input
                    readOnly
                    value=""
                    placeholder="Məhsul, satıcı və ya sifariş axtar..."
                    className="h-11 w-full rounded-xl border border-[#e3ddd3] bg-[#fbfbfa] px-4 text-sm text-stone-600 outline-none"
                  />
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-[#dfd8cd] bg-white px-2 py-0.5 text-[11px] text-stone-500">
                    Cmd+K
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="grid h-9 w-9 place-items-center rounded-full border border-[#e3ddd3] bg-white text-sm text-stone-500"
                  >
                    @
                  </button>
                  <button
                    type="button"
                    className="grid h-9 w-9 place-items-center rounded-full border border-[#e3ddd3] bg-white text-sm text-stone-500"
                  >
                    !
                  </button>
                  <Link
                    href="/admin/security"
                    className="rounded-xl border border-[#e3ddd3] px-3 py-2 text-xs text-stone-600 hover:bg-stone-50"
                  >
                    Bildirişlər
                  </Link>
                  <Link
                    href="/admin/settings"
                    className="rounded-xl border border-[#e3ddd3] px-3 py-2 text-xs text-stone-600 hover:bg-stone-50"
                  >
                    Profil
                  </Link>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[#f0ece4] text-xs font-semibold text-stone-700">
                    ZA
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#ece7de] bg-white p-3.5 md:p-5">{children}</div>
          </section>
        </div>
      </div>
    </div>
  );
}
