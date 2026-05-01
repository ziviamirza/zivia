"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatAzn } from "@/lib/format";
import {
  readCartLines,
  writeCartLines,
  type CartLine,
} from "@/lib/cart-storage";
import { createClient } from "@/lib/supabase/client";
import { primaryProductImageUrl } from "@/lib/product-images";
import { getSupportWhatsAppUrl } from "@/lib/site";

const shippingFee = 0;
const taxFee = 0;

type ProductRow = {
  id: string | number;
  title: string | null;
  slug: string;
  price: number | string | null;
  category?: string | null;
  image?: string | null;
  images?: unknown;
};

type RowState =
  | { kind: "ok"; line: CartLine; product: ProductRow; image: string | null }
  | { kind: "missing"; line: CartLine };

export default function CartPage() {
  const [lines, setLines] = useState<CartLine[]>(() => {
    if (typeof window === "undefined") return [];
    return readCartLines();
  });
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [coupon, setCoupon] = useState("");

  useEffect(() => {
    const onCart = () => setLines(readCartLines());
    window.addEventListener("zivia-cart", onCart);
    return () => window.removeEventListener("zivia-cart", onCart);
  }, []);

  useEffect(() => {
    const slugs = lines.map((l) => l.slug);
    if (slugs.length === 0) {
      return;
    }

    let cancelled = false;

    (async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("id, title, slug, price, category, image, images")
        .in("slug", slugs);

      if (cancelled) return;
      if (error) {
        setLoadError("Məhsullar yüklənmədi. İnternet bağlantısını yoxlayın.");
        setRows([]);
        return;
      }
      setRows((data ?? []) as ProductRow[]);
    })();

    return () => {
      cancelled = true;
    };
  }, [lines]);

  const bySlug = useMemo(() => {
    const m = new Map<string, ProductRow>();
    for (const r of rows) {
      if (r.slug) m.set(r.slug, r);
    }
    return m;
  }, [rows]);

  const displayRows: RowState[] = useMemo(() => {
    return lines.map((line) => {
      const product = bySlug.get(line.slug);
      if (!product) return { kind: "missing" as const, line };
      return {
        kind: "ok" as const,
        line,
        product,
        image: primaryProductImageUrl(product),
      };
    });
  }, [lines, bySlug]);

  const productsTotal = useMemo(() => {
    let sum = 0;
    for (const r of displayRows) {
      if (r.kind !== "ok") continue;
      sum += Number(r.product.price ?? 0) * r.line.qty;
    }
    return sum;
  }, [displayRows]);

  const grandTotal = productsTotal + shippingFee + taxFee;

  const whatsappCheckoutHref = useMemo(() => {
    const okRows = displayRows.filter(
      (r): r is Extract<RowState, { kind: "ok" }> => r.kind === "ok",
    );
    if (!okRows.length) return "";

    const baseUrl =
      typeof window !== "undefined" ? window.location.origin : "https://zivia.az";
    const linesText = okRows.map((row, idx) => {
      const title = row.product.title?.trim() || "Məhsul";
      const qty = row.line.qty;
      const unitPrice = Number(row.product.price ?? 0);
      const lineTotal = unitPrice * qty;
      const productLink = `${baseUrl}/products/${encodeURIComponent(row.line.slug)}`;
      const imageLink = row.image ?? "";

      return [
        `${idx + 1}) ${title}`,
        `- Say: ${qty}`,
        `- Qiymət: ${formatAzn(unitPrice)} (cəmi: ${formatAzn(lineTotal)})`,
        `- Məhsul linki: ${productLink}`,
        imageLink ? `- Şəkil: ${imageLink}` : null,
      ]
        .filter(Boolean)
        .join("\n");
    });

    const message = [
      "Salam, səbətimdəki məhsulları sifariş etmək istəyirəm:",
      "",
      ...linesText,
      "",
      `Sifariş cəmi: ${formatAzn(grandTotal)}`,
    ].join("\n");

    return getSupportWhatsAppUrl(message);
  }, [displayRows, grandTotal]);

  function increaseQty(slug: string) {
    const cur = readCartLines();
    const next = cur.map((item) =>
      item.slug === slug ? { ...item, qty: Math.min(99, item.qty + 1) } : item,
    );
    writeCartLines(next);
    setLines(next);
  }

  function decreaseQty(slug: string) {
    const cur = readCartLines();
    const next = cur.map((item) =>
      item.slug === slug ? { ...item, qty: Math.max(1, item.qty - 1) } : item,
    );
    writeCartLines(next);
    setLines(next);
  }

  function removeLine(slug: string) {
    const cur = readCartLines();
    const next = cur.filter((item) => item.slug !== slug);
    writeCartLines(next);
    setLines(next);
  }

  return (
    <div className="space-y-4 px-3 py-4 md:px-4 lg:px-5">
      <h1 className="font-display text-3xl leading-none text-stone-900 md:text-4xl">
        Səbət
      </h1>

      <div className="grid gap-4 lg:grid-cols-[1.85fr_1fr]">
        <section className="app-surface p-3 md:p-4">
          <h2 className="text-lg font-semibold text-stone-900">
            Seçilmiş məhsullar ({lines.length})
          </h2>

          {loadError ? (
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {loadError}
            </p>
          ) : null}

          <div className="mt-3 space-y-2.5">
            {lines.length ? (
              displayRows.map((row) =>
                row.kind === "missing" ? (
                  <article
                    key={row.line.slug}
                    className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 md:p-4"
                  >
                    <p className="text-sm font-medium text-stone-900">
                      Məhsul artıq mövcud deyil
                    </p>
                    <p className="mt-1 text-xs text-stone-600">
                      Slug: <span className="font-mono">{row.line.slug}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => removeLine(row.line.slug)}
                      className="app-btn-secondary mt-3 h-9 px-4 text-sm"
                    >
                      Səbətdən sil
                    </button>
                  </article>
                ) : (
                  <article
                    key={row.line.slug}
                    className="rounded-xl border border-[#e3d5bf] bg-[#fdf9f1] p-2.5 md:p-3"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-[#e7dac5] bg-neutral-100">
                          {row.image &&
                          (row.image.startsWith("http://") ||
                            row.image.startsWith("https://")) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={row.image}
                              alt={row.product.title ?? "Məhsul"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-stone-400">
                              Şəkil yoxdur
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold leading-tight text-stone-900">
                            <Link
                              href={`/products/${encodeURIComponent(row.line.slug)}`}
                              className="hover:text-[#8b6b2c]"
                            >
                              {row.product.title ?? "Məhsul"}
                            </Link>
                          </h3>
                          {row.product.category ? (
                            <p className="mt-0.5 text-xs text-stone-500">
                              {row.product.category}
                            </p>
                          ) : null}
                          <p className="mt-1 text-xl font-semibold leading-none text-stone-900 md:text-2xl">
                            {formatAzn(Number(row.product.price ?? 0))}
                            {row.line.qty > 1 ? (
                              <span className="ml-1 text-sm font-normal text-stone-600">
                                × {row.line.qty}
                              </span>
                            ) : null}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <div className="inline-flex items-center rounded-full border border-[#d4bf8f] bg-[#d2b06b]/75 p-0.5">
                          <button
                            type="button"
                            onClick={() => decreaseQty(row.line.slug)}
                            className="h-8 w-9 rounded-full text-lg leading-none text-stone-900 transition hover:bg-[#b9934b]/20"
                            aria-label="Azalt"
                          >
                            −
                          </button>
                          <span className="inline-flex min-w-8 justify-center text-base font-medium text-stone-900">
                            {row.line.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => increaseQty(row.line.slug)}
                            className="h-8 w-9 rounded-full text-lg leading-none text-stone-900 transition hover:bg-[#b9934b]/20"
                            aria-label="Artır"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLine(row.line.slug)}
                          className="app-btn-secondary h-9 min-w-[84px] px-4 text-sm leading-none"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  </article>
                ),
              )
            ) : (
              <div className="rounded-xl border border-dashed border-[#dbc9aa] bg-[#fffaf1] p-4 text-sm text-stone-600">
                <p>Səbətiniz boşdur.</p>
                <Link href="/products" className="mt-2 inline-block text-[#8b6b2c] underline">
                  Məhsullara keç
                </Link>
              </div>
            )}
          </div>
        </section>

        <aside className="app-surface h-fit p-3 md:p-4">
          <h2 className="font-display text-2xl leading-none text-stone-900 md:text-3xl">
            Sifariş xülasəsi
          </h2>

          <div className="mt-3 space-y-2 rounded-xl border border-[#e4d7c2] bg-[#fdf9f1] p-3 text-sm leading-tight text-stone-900 md:text-base">
            <div className="flex items-center justify-between gap-2">
              <span>Məhsulların qiyməti</span>
              <span className="font-semibold">{formatAzn(productsTotal)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span>Çatdırılma</span>
              <span>{shippingFee ? formatAzn(shippingFee) : "Pulsuz / WhatsApp"}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span>Vergi</span>
              <span>{taxFee ? formatAzn(taxFee) : "—"}</span>
            </div>
          </div>

          <div className="mt-3">
            <p className="text-sm leading-none text-stone-900 md:text-base">Kupon</p>
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Tezliklə"
              className="mt-2 h-10 w-full rounded-xl border border-[#ddd0bb] bg-[#f3ecdf] px-3 text-sm text-stone-700 outline-none focus:border-[#b08a42] md:h-11 md:text-base"
            />
          </div>

          <div className="mt-4 border-t border-[#e3d6c1] pt-3">
            <div className="flex items-center justify-between text-base leading-none text-stone-900 md:text-xl">
              <span className="font-semibold">Cəmi</span>
              <span className="font-semibold">{formatAzn(grandTotal)}</span>
            </div>
            <p className="mt-1 text-xs text-stone-600 md:text-sm">
              Ödəniş hələ aktiv deyil — satıcı ilə WhatsApp üzərindən razılaşın.
            </p>
          </div>

          {whatsappCheckoutHref ? (
            <a
              href={whatsappCheckoutHref}
              target="_blank"
              rel="noopener noreferrer"
              className="app-btn-primary mt-3 w-full justify-center"
            >
              WhatsApp ilə sifarişi tamamla
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="app-btn-primary mt-3 w-full cursor-not-allowed justify-center opacity-60"
            >
              Ödəniş üçün məhsul seçin
            </button>
          )}

          <div className="mt-3 space-y-1 text-center text-xs leading-tight text-stone-800 md:text-sm">
            <p>Səbət brauzerinizdə saxlanılır</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
