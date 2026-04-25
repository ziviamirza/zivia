"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = {
  href: string;
  label: string;
};

const navItems: Item[] = [
  { href: "/admin", label: "Daxili Baxış" },
  { href: "/admin/sellers", label: "Satıcı idarəetməsi" },
  { href: "/admin/products", label: "Kataloq" },
  { href: "/admin/orders", label: "Sifarişlər" },
  { href: "/admin/analytics", label: "Analitika" },
  { href: "/admin/finance", label: "Maliyyə" },
  { href: "/admin/security", label: "Təhlükəsizlik" },
  { href: "/admin/settings", label: "Ayarlar" },
  { href: "/admin/users", label: "İstifadəçilər" },
];

export default function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 rounded-2xl border border-[#ece7de] bg-white p-4 lg:w-72">
      <div className="mb-5 flex items-center gap-2 px-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-black text-sm font-bold text-white">Z</div>
        <div>
          <p className="font-semibold text-stone-900">Zivia.az</p>
          <p className="text-xs text-stone-500">Admin panel</p>
        </div>
      </div>

      <nav className="space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={[
                "block rounded-xl px-3 py-2 text-sm transition",
                isActive
                  ? "bg-[#ff7a00] font-medium text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)]"
                  : "text-stone-700 hover:bg-stone-100",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-5 border-t border-stone-200 pt-4">
        <Link href="/" onClick={onNavigate} className="block rounded-xl px-3 py-2 text-sm text-stone-600 hover:bg-stone-100">
          Sayta keç
        </Link>
        <form method="post" action="/admin/logout" className="mt-1">
          <button
            type="submit"
            className="w-full rounded-xl border border-stone-200 px-3 py-2 text-left text-sm text-stone-700 transition hover:bg-stone-100"
          >
            Çıxış et
          </button>
        </form>
      </div>
    </aside>
  );
}
