import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { categories } from "@/data/categories";
import { primaryProductImageUrl } from "@/lib/product-images";
import { supabase } from "@/lib/supabase";

export const metadata = {
  title: "Məhsullar",
  description:
    "Zivia üzərində bijuteriya və zərgərlik məhsullarını kəşf edin. Kateqoriyalar və satıcılar ilə premium seçim.",
};

type ProductRow = {
  id: string | number;
  title: string;
  category: string;
  price: number | string;
  slug: string;
  image?: string | null;
  images?: unknown;
};

function escapeIlike(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

type SearchParams = { q?: string; category?: string };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const category = sp.category?.trim() ?? "";

  let query = supabase
    .from("products")
    .select("*")
    .order("id", { ascending: false });

  if (category && category !== "Hamısı") {
    query = query.eq("category", category);
  }

  if (q) {
    const safe = escapeIlike(q);
    query = query.or(
      `title.ilike.%${safe}%,description.ilike.%${safe}%,category.ilike.%${safe}%`,
    );
  }

  const { data: products, error } = await query;

  const list = (products ?? []) as ProductRow[];

  return (
    <div className="space-y-4 px-3 pt-3 md:px-4">
      <section className="app-surface p-3">
        <h1 className="font-display text-2xl text-stone-900">Məhsullar</h1>
        <p className="mt-1 text-xs text-stone-500">Mobil vitrin siyahısı</p>

        <form method="get" action="/products" className="mt-3 space-y-2">
          {category ? <input type="hidden" name="category" value={category} /> : null}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Axtar..."
            className="app-input"
          />
          <button type="submit" className="app-btn-primary w-full justify-center">
            Axtar
          </button>
        </form>
      </section>

      <section className="app-scroll-x -mx-3 flex gap-2 px-3 pb-1">
        <Link
          href={q ? `/products?q=${encodeURIComponent(q)}` : "/products"}
          className={`rounded-full border px-3 py-1.5 text-xs ${
            !category || category === "Hamısı"
              ? "border-[#b08a42] bg-[#b08a42] text-white"
              : "border-[#d9ccb5] bg-white text-stone-700"
          }`}
        >
          Hamısı
        </Link>
        {categories.map((c) => {
          const active = category === c.name;
          const qs = new URLSearchParams();
          if (q) qs.set("q", q);
          qs.set("category", c.name);
          return (
            <Link
              key={c.id}
              href={`/products?${qs.toString()}`}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs ${
                active
                  ? "border-[#b08a42] bg-[#b08a42] text-white"
                  : "border-[#d9ccb5] bg-white text-stone-700"
              }`}
            >
              {c.name}
            </Link>
          );
        })}
      </section>

      <section>
        {error ? (
          <p className="app-surface p-4 text-sm text-red-700">
            Məhsullar hazırda göstərilə bilmir. Səhifəni yeniləyin və yenidən cəhd edin.
          </p>
        ) : (
          <>
            <p className="px-1 text-xs text-stone-500">
              {list.length} nəticə
              {q ? ` · "${q}"` : ""}
              {category && category !== "Hamısı" ? ` · ${category}` : ""}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
              {list.map((product) => (
                <ProductCard
                  key={String(product.id)}
                  title={product.title}
                  category={product.category}
                  price={Number(product.price)}
                  slug={product.slug}
                  imageUrl={primaryProductImageUrl(product)}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
