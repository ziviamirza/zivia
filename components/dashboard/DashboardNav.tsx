"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    href: "/dashboard",
    label: "Məhsullarım",
    match: (path: string | null) =>
      path === "/dashboard" || Boolean(path?.startsWith("/dashboard/products/")),
  },
  {
    href: "/dashboard/new-product",
    label: "Yeni məhsul",
    match: (path: string | null) => path === "/dashboard/new-product",
  },
  {
    href: "/dashboard/profile",
    label: "Profil",
    match: (path: string | null) => path === "/dashboard/profile",
  },
] as const;

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {items.map(({ href, label, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={
                active
                  ? "rounded-full bg-gradient-to-b from-amber-700 to-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-amber-900/20"
                  : "rounded-full border border-amber-100 bg-white/95 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-amber-200 hover:bg-amber-50/60"
              }
            >
              {label}
            </Link>
          );
        })}
      </div>
      <Link
        href="/"
        className="text-sm font-medium text-neutral-500 transition hover:text-amber-900"
      >
        ← Sayta qayıt
      </Link>
    </div>
  );
}
