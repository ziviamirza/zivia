"use client";

import { useMemo, useState } from "react";
import { formatAzn } from "@/lib/format";

type CartItem = {
  id: string;
  title: string;
  image: string;
  rating: number;
  price: number;
  qty: number;
};

const shippingFee = 0;
const taxFee = 10;

const initialItems: CartItem[] = [
  {
    id: "1",
    title: "Mas: Ulduzlu Boyunbağı",
    image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=500&q=80",
    rating: 5,
    price: 180,
    qty: 1,
  },
  {
    id: "2",
    title: "Brilliant Üzük",
    image: "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=500&q=80",
    rating: 5,
    price: 180,
    qty: 1,
  },
  {
    id: "3",
    title: "Diamond Bracelet",
    image: "https://images.unsplash.com/photo-1601821765780-754fa98637c1?auto=format&fit=crop&w=500&q=80",
    rating: 5,
    price: 180,
    qty: 1,
  },
  {
    id: "4",
    title: "Mas: Star-bur Pendant",
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=500&q=80",
    rating: 5,
    price: 180,
    qty: 1,
  },
];

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [coupon, setCoupon] = useState("ZIVIA20");

  const productsTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.qty, 0),
    [items],
  );
  const grandTotal = productsTotal + shippingFee + taxFee;

  function increaseQty(id: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item)),
    );
  }

  function decreaseQty(id: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty - 1) } : item,
      ),
    );
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-4 px-3 py-4 md:px-4 lg:px-5">
      <h1 className="font-display text-3xl leading-none text-stone-900 md:text-4xl">
        Səbət
      </h1>

      <div className="grid gap-4 lg:grid-cols-[1.85fr_1fr]">
        <section className="app-surface p-3 md:p-4">
          <h2 className="text-lg font-semibold text-stone-900">
            Seçilmiş Məhsullar ({items.length})
          </h2>

          <div className="mt-3 space-y-2.5">
            {items.length ? (
              items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-[#e3d5bf] bg-[#fdf9f1] p-2.5 md:p-3"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-20 w-20 rounded-lg border border-[#e7dac5] object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-semibold leading-tight text-stone-900">
                          {item.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-[#b08a42] md:text-sm">
                          {"★".repeat(item.rating)}
                        </p>
                        <p className="mt-1 text-xl font-semibold leading-none text-stone-900 md:text-2xl">
                          {formatAzn(item.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <div className="inline-flex items-center rounded-full border border-[#d4bf8f] bg-[#d2b06b]/75 p-0.5">
                        <button
                          type="button"
                          onClick={() => decreaseQty(item.id)}
                          className="h-8 w-9 rounded-full text-lg leading-none text-stone-900 transition hover:bg-[#b9934b]/20"
                          aria-label="Azalt"
                        >
                          −
                        </button>
                        <span className="inline-flex min-w-8 justify-center text-base font-medium text-stone-900">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => increaseQty(item.id)}
                          className="h-8 w-9 rounded-full text-lg leading-none text-stone-900 transition hover:bg-[#b9934b]/20"
                          aria-label="Artır"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="app-btn-secondary h-9 min-w-[84px] px-4 text-sm leading-none"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-[#dbc9aa] bg-[#fffaf1] p-4 text-sm text-stone-600">
                Səbətiniz hazırda boşdur.
              </p>
            )}
          </div>
        </section>

        <aside className="app-surface h-fit p-3 md:p-4">
          <h2 className="font-display text-2xl leading-none text-stone-900 md:text-3xl">
            Sifariş Xülasəsi
          </h2>

          <div className="mt-3 space-y-2 rounded-xl border border-[#e4d7c2] bg-[#fdf9f1] p-3 text-sm leading-tight text-stone-900 md:text-base">
            <div className="flex items-center justify-between gap-2">
              <span>Məhsulların qiyməti</span>
              <span className="font-semibold">{formatAzn(productsTotal)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span>Çatdırılma</span>
              <span>{shippingFee ? formatAzn(shippingFee) : "Çatdırılır"}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span>Vergi</span>
              <span>{formatAzn(taxFee)}</span>
            </div>
          </div>

          <div className="mt-3">
            <p className="text-sm leading-none text-stone-900 md:text-base">Kupon</p>
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              className="mt-2 h-10 w-full rounded-xl border border-[#ddd0bb] bg-[#f3ecdf] px-3 text-sm text-stone-700 outline-none focus:border-[#b08a42] md:h-11 md:text-base"
            />
          </div>

          <div className="mt-4 border-t border-[#e3d6c1] pt-3">
            <div className="flex items-center justify-between text-base leading-none text-stone-900 md:text-xl">
              <span className="font-semibold">Cəmi Qiymət</span>
              <span className="font-semibold">{formatAzn(grandTotal)}</span>
            </div>
            <p className="mt-1 text-xs text-stone-600 md:text-sm">
              Zəhmət olmasa təsdiqləyin
            </p>
          </div>

          <button type="button" className="app-btn-primary mt-3 w-full justify-center">
            Ödənişə keç
          </button>

          <div className="mt-3 space-y-1 text-center text-xs leading-tight text-stone-800 md:text-sm">
            <p>Sifarişi Təsdiqlə</p>
            <p>Bəyənilənlərə əlavə et</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
