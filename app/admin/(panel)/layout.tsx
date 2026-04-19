import Link from "next/link";
import { requireAdminOrRedirect } from "@/lib/admin-guard";

export default async function AdminPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdminOrRedirect();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#1c1917] text-stone-100">
      <div className="border-b border-stone-700 bg-[#141210]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="font-display text-lg tracking-tight text-[#e8d5b0]">Zivia admin</span>
            <span className="hidden text-[10px] text-stone-500 sm:inline">
              (Satıcı / Supabase hesabından ayrı)
            </span>
            <nav className="flex flex-wrap gap-2">
              <Link
                href="/admin"
                className="rounded-lg px-2.5 py-1 text-stone-300 transition hover:bg-stone-800 hover:text-white"
              >
                İcmal
              </Link>
              <Link
                href="/admin/products"
                className="rounded-lg px-2.5 py-1 text-stone-300 transition hover:bg-stone-800 hover:text-white"
              >
                Məhsullar
              </Link>
              <Link
                href="/admin/sellers"
                className="rounded-lg px-2.5 py-1 text-stone-300 transition hover:bg-stone-800 hover:text-white"
              >
                Satıcılar
              </Link>
              <Link
                href="/"
                className="rounded-lg px-2.5 py-1 text-stone-400 transition hover:bg-stone-800 hover:text-white"
              >
                Vitrinə
              </Link>
            </nav>
          </div>
          <form method="post" action="/admin/logout">
            <button
              type="submit"
              className="rounded-lg border border-stone-600 px-3 py-1.5 text-xs font-semibold text-stone-200 transition hover:bg-stone-800"
            >
              Çıxış
            </button>
          </form>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
    </div>
  );
}
