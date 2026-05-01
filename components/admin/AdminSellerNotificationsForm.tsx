"use client";

import { useState } from "react";

type SellerOption = {
  id: number;
  name: string | null;
  slug: string | null;
  user_id: string | null;
};

export default function AdminSellerNotificationsForm({ sellers }: { sellers: SellerOption[] }) {
  const withAccount = sellers.filter((s) => s.user_id);
  const [scope, setScope] = useState<"all" | "seller">("seller");
  const [sellerId, setSellerId] = useState<string>("");
  const [type, setType] = useState<"promo" | "system">("promo");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [href, setHref] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    const sid = Number(sellerId);
    const payload = {
      scope,
      ...(scope === "seller" ? { sellerId: sid } : {}),
      type,
      title: title.trim(),
      body: body.trim() || undefined,
      href: href.trim() || undefined,
    };
    try {
      const res = await fetch("/api/admin/seller-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string; sent?: number };
      if (!res.ok) {
        setStatus("err");
        setMessage(json.error ?? "Xəta baş verdi.");
        return;
      }
      setStatus("ok");
      setMessage(`${json.sent ?? 0} satıcıya göndərildi.`);
    } catch {
      setStatus("err");
      setMessage("Şəbəkə xətası.");
    }
  }

  return (
    <form onSubmit={submit} className="max-w-xl space-y-4 rounded-xl border border-[#ece7de] bg-white p-5">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Ünvan</p>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-800">
          <input type="radio" name="scope" checked={scope === "seller"} onChange={() => setScope("seller")} />
          Bir satıcıya
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-800">
          <input type="radio" name="scope" checked={scope === "all"} onChange={() => setScope("all")} />
          Hamıya (bütün bağlı hesablı satıcılar)
        </label>
      </div>

      {scope === "seller" ? (
        <div>
          <label className="block text-xs font-medium text-stone-600">Satıcı</label>
          <select
            required
            value={sellerId}
            onChange={(e) => setSellerId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900"
          >
            <option value="">— seçin —</option>
            {withAccount.map((s) => (
              <option key={s.id} value={String(s.id)}>
                #{s.id} · {s.name ?? s.slug ?? "adsız"}
              </option>
            ))}
          </select>
          {withAccount.length === 0 ? (
            <p className="mt-1 text-xs text-amber-700">user_id olan satıcı yoxdur.</p>
          ) : null}
        </div>
      ) : null}

      <div>
        <label className="block text-xs font-medium text-stone-600">Növ</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "promo" | "system")}
          className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900"
        >
          <option value="promo">Xəbər / promo</option>
          <option value="system">Sistem</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-stone-600">Başlıq</label>
        <input
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900"
          placeholder="Qısa başlıq"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-stone-600">Mətn (istəyə bağlı)</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={4000}
          className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900"
          placeholder="Əlavə izah..."
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-stone-600">Keçid (istəyə bağlı)</label>
        <input
          maxLength={500}
          value={href}
          onChange={(e) => setHref(e.target.value)}
          className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 font-mono text-xs text-stone-900"
          placeholder="/dashboard və ya tam URL"
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading" || (scope === "seller" && !sellerId)}
        className="rounded-xl bg-[#ff7a00] px-4 py-2.5 text-sm font-semibold text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)] disabled:opacity-50"
      >
        {status === "loading" ? "Göndərilir..." : "Göndər"}
      </button>

      {message ? (
        <p className={status === "err" ? "text-sm text-red-700" : "text-sm text-green-700"}>{message}</p>
      ) : null}
    </form>
  );
}
