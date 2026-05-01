import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { initialsFromName } from "@/lib/social-links";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Satıcılar",
  description: "Zivia satıcı vitrinləri — zərgərlik və bijuteriya.",
};

export default async function SellersIndexPage() {
  const { data: rows, error } = await supabase
    .from("sellers")
    .select("id, slug, name, description, avatar")
    .order("id", { ascending: false });

  const list = rows ?? [];

  return (
    <div className="space-y-4 px-3 py-4 md:px-4">
      <div>
        <h1 className="font-display text-3xl text-stone-900">Satıcılar</h1>
        <p className="mt-1 text-sm text-stone-600">
          Bütün vitrinlər — birbaşa profilə keçid.
        </p>
      </div>

      {error ? (
        <p className="app-surface p-4 text-sm text-red-700">
          Siyahı yüklənmədi. Bir az sonra yenidən cəhd edin.
        </p>
      ) : list.length === 0 ? (
        <p className="app-surface p-6 text-sm text-stone-600">Hələ satıcı yoxdur.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list
            .filter((s) => typeof s.slug === "string" && Boolean(s.slug.trim()))
            .map((s) => {
              const slug = String(s.slug).trim();
              const name = String(s.name ?? "Satıcı");
              const initials = initialsFromName(name);
              const desc =
                typeof s.description === "string" && s.description.trim()
                  ? s.description.trim().slice(0, 120)
                  : "";
              return (
                <li key={s.id}>
                  <Link
                    href={`/sellers/${encodeURIComponent(slug)}`}
                    className="app-surface flex gap-3 p-3 transition hover:border-[#c4a574]"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                      {s.avatar?.startsWith("http") ? (
                        <Image
                          src={s.avatar}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-sm font-bold text-amber-900/70">
                          {initials}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-stone-900">{name}</p>
                      {desc ? (
                        <p className="mt-0.5 line-clamp-2 text-xs text-stone-600">{desc}</p>
                      ) : (
                        <p className="mt-0.5 text-xs text-stone-400">Vitrin</p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}
