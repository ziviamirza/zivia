"use client";

import { useMemo, useState } from "react";

export type AdminHeroSlideRow = {
  id: number;
  sort_order: number;
  image_url: string;
  alt_text: string;
  link_url: string | null;
  is_active: boolean;
};

type EditableRow = AdminHeroSlideRow & { isNew?: boolean };

function fullShareUrl(siteUrl: string, link: string): string {
  const t = link.trim();
  if (!t) return `${siteUrl.replace(/\/$/, "")}/products`;
  if (/^https?:\/\//i.test(t)) return t;
  const path = t.startsWith("/") ? t : `/${t}`;
  return `${siteUrl.replace(/\/$/, "")}${path}`;
}

export default function AdminHeroSlidesForm({
  initialSlides,
  siteUrl,
  serviceConfigured,
}: {
  initialSlides: AdminHeroSlideRow[];
  siteUrl: string;
  serviceConfigured: boolean;
}) {
  const [rows, setRows] = useState<EditableRow[]>(() =>
    [...initialSlides].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id),
  );
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busyId, setBusyId] = useState<string | number | null>(null);

  const maxSort = useMemo(() => rows.reduce((m, r) => Math.max(m, r.sort_order), 0), [rows]);

  function setRow(id: number | "new", patch: Partial<EditableRow>) {
    setRows((prev) =>
      id === "new"
        ? prev.map((r) => (r.isNew ? { ...r, ...patch } : r))
        : prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );
  }

  async function saveRow(row: EditableRow) {
    setMsg(null);
    const key = row.isNew ? "new" : row.id;
    setBusyId(key);

    try {
      if (row.isNew) {
        const res = await fetch("/api/admin/hero-slides", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sort_order: row.sort_order,
            image_url: row.image_url.trim(),
            alt_text: row.alt_text,
            link_url: row.link_url?.trim() || null,
            is_active: row.is_active,
          }),
        });
        const json = (await res.json().catch(() => ({}))) as { error?: string; slide?: AdminHeroSlideRow };
        if (!res.ok) {
          setMsg({ kind: "err", text: json.error ?? "Əlavə olunmadı." });
          return;
        }
        if (json.slide) {
          setRows((prev) => prev.filter((r) => !r.isNew).concat([json.slide!]).sort((a, b) => a.sort_order - b.sort_order || a.id - b.id));
        }
        setMsg({ kind: "ok", text: "Slayd əlavə olundu." });
        return;
      }

      const res = await fetch(`/api/admin/hero-slides/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sort_order: row.sort_order,
          image_url: row.image_url.trim(),
          alt_text: row.alt_text,
          link_url: row.link_url?.trim() ? row.link_url.trim() : null,
          is_active: row.is_active,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string; slide?: AdminHeroSlideRow };
      if (!res.ok) {
        setMsg({ kind: "err", text: json.error ?? "Yenilənmədi." });
        return;
      }
      if (json.slide) {
        setRows((prev) => prev.map((r) => (r.id === row.id ? { ...json.slide!, isNew: false } : r)));
      }
      setMsg({ kind: "ok", text: "Yadda saxlanıldı." });
    } catch {
      setMsg({ kind: "err", text: "Şəbəkə xətası." });
    } finally {
      setBusyId(null);
    }
  }

  async function deleteRow(id: number) {
    if (!window.confirm("Bu slaydı silmək istəyirsiniz?")) return;
    setBusyId(id);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/hero-slides/${id}`, { method: "DELETE" });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setMsg({ kind: "err", text: json.error ?? "Silinmədi." });
        return;
      }
      setRows((prev) => prev.filter((r) => r.id !== id));
      setMsg({ kind: "ok", text: "Silindi." });
    } catch {
      setMsg({ kind: "err", text: "Şəbəkə xətası." });
    } finally {
      setBusyId(null);
    }
  }

  async function uploadForRow(rowKey: number | "new", file: File) {
    setMsg(null);
    setBusyId(rowKey);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/admin/hero-slides/upload", { method: "POST", body: fd });
      const json = (await res.json().catch(() => ({}))) as { error?: string; url?: string };
      if (!res.ok || !json.url) {
        setMsg({ kind: "err", text: json.error ?? "Yükləmə alınmadı." });
        return;
      }
      if (rowKey === "new") {
        setRow("new", { image_url: json.url });
      } else {
        setRow(rowKey, { image_url: json.url });
      }
      setMsg({ kind: "ok", text: "Şəkil yükləndi — Yadda saxla ilə saxlayın." });
    } catch {
      setMsg({ kind: "err", text: "Şəbəkə xətası." });
    } finally {
      setBusyId(null);
    }
  }

  function addRow() {
    if (rows.some((r) => r.isNew)) {
      setMsg({ kind: "err", text: "Əvvəlcə yeni sətri saxlayın və ya ləğv edin." });
      return;
    }
    if (rows.length >= 15) {
      setMsg({ kind: "err", text: "Ən çox 15 slayd." });
      return;
    }
    setRows((prev) => [
      ...prev,
      {
        id: -1,
        sort_order: Math.min(100, maxSort + 1),
        image_url: "",
        alt_text: "",
        link_url: "/products",
        is_active: true,
        isNew: true,
      },
    ]);
    setMsg(null);
  }

  function cancelNew() {
    setRows((prev) => prev.filter((r) => !r.isNew));
  }

  async function copyShare(link: string) {
    const text = fullShareUrl(siteUrl || (typeof window !== "undefined" ? window.location.origin : ""), link);
    try {
      await navigator.clipboard.writeText(text);
      setMsg({ kind: "ok", text: "Link mübadilə buferinə kopyalandı." });
    } catch {
      setMsg({ kind: "err", text: "Kopyalama alınmadı." });
    }
  }

  if (!serviceConfigured) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Serverdə <code className="rounded bg-white px-1">SUPABASE_SERVICE_ROLE_KEY</code> təyin edin və migrasiyanı
        (SQL Editor) işə salın: <code className="rounded bg-white px-1">20260504120000_home_hero_slides.sql</code>
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">Hero karuseli</h2>
          <p className="mt-1 max-w-2xl text-sm text-stone-600">
            Şəkil URL-i Unsplash və ya bu paneldən yüklənmiş{" "}
            <code className="rounded bg-stone-100 px-1 text-xs">hero-images</code> faylı ola bilər. Keçid sahəsi
            kampaniya üçün: məsələn <code className="rounded bg-stone-100 px-1 text-xs">/products?q=...</code> və ya
            tam https link. &quot;Kəşf et&quot; düyməsi aktiv slaydın keçidini açır.
          </p>
        </div>
        <button
          type="button"
          onClick={addRow}
          className="rounded-xl bg-[#ff7a00] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#ef7300]"
        >
          Slayd əlavə et
        </button>
      </div>

      {msg ? (
        <p
          role="status"
          className={
            msg.kind === "ok"
              ? "rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
              : "rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
          }
        >
          {msg.text}
        </p>
      ) : null}

      <div className="space-y-5">
        {rows.map((row) => {
          const rk = row.isNew ? ("new" as const) : row.id;
          const busy = busyId === rk || busyId === row.id;
          return (
            <article
              key={row.isNew ? "new-row" : row.id}
              className="rounded-2xl border border-[#ece7de] bg-[#fcfcfb] p-4 shadow-sm"
            >
              <div className="flex flex-wrap gap-4">
                <div className="relative h-28 w-40 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-200">
                  {row.image_url.trim() ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={row.image_url.trim()} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-stone-500">Şəkil yoxdur</div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block text-xs font-medium text-stone-600">
                      Sıra (1–100)
                      <input
                        type="number"
                        min={1}
                        max={100}
                        className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
                        value={row.sort_order}
                        onChange={(e) =>
                          row.isNew
                            ? setRow("new", { sort_order: Number(e.target.value) || 1 })
                            : setRow(row.id, { sort_order: Number(e.target.value) || 1 })
                        }
                      />
                    </label>
                    <label className="block text-xs font-medium text-stone-600 sm:col-span-2">
                      Şəkil URL
                      <input
                        type="url"
                        className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
                        value={row.image_url}
                        onChange={(e) =>
                          row.isNew
                            ? setRow("new", { image_url: e.target.value })
                            : setRow(row.id, { image_url: e.target.value })
                        }
                        placeholder="https://images.unsplash.com/... və ya yükləmədən sonra avtomatik"
                      />
                    </label>
                    <label className="block text-xs font-medium text-stone-600 sm:col-span-2">
                      Alt mətn (accessibility)
                      <input
                        type="text"
                        className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
                        value={row.alt_text}
                        onChange={(e) =>
                          row.isNew ? setRow("new", { alt_text: e.target.value }) : setRow(row.id, { alt_text: e.target.value })
                        }
                      />
                    </label>
                    <label className="block text-xs font-medium text-stone-600 sm:col-span-2">
                      Keçid (CTA — kampaniya)
                      <input
                        type="text"
                        className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
                        value={row.link_url ?? ""}
                        onChange={(e) =>
                          row.isNew
                            ? setRow("new", { link_url: e.target.value || null })
                            : setRow(row.id, { link_url: e.target.value || null })
                        }
                        placeholder="/products və ya https://..."
                      />
                    </label>
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-800">
                    <input
                      type="checkbox"
                      checked={row.is_active}
                      onChange={(e) =>
                        row.isNew
                          ? setRow("new", { is_active: e.target.checked })
                          : setRow(row.id, { is_active: e.target.checked })
                      }
                    />
                    Aktiv (saytda görünsün)
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        disabled={busy}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = "";
                          if (f) void uploadForRow(rk, f);
                        }}
                      />
                      Fayl yüklə (hero-images)
                    </label>
                    {!row.isNew ? (
                      <button
                        type="button"
                        onClick={() => void copyShare(row.link_url ?? "/products")}
                        className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
                      >
                        Tam linki kopyala
                      </button>
                    ) : null}
                    {row.isNew ? (
                      <button
                        type="button"
                        onClick={cancelNew}
                        className="rounded-lg border border-stone-200 px-3 py-2 text-xs text-stone-600 hover:bg-stone-50"
                      >
                        Ləğv
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void deleteRow(row.id)}
                        disabled={busy}
                        className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        Sil
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={busy || !row.image_url.trim()}
                      onClick={() => void saveRow(row)}
                      className="rounded-lg bg-[#ff7a00] px-4 py-2 text-xs font-medium text-white hover:bg-[#ef7300] disabled:opacity-50"
                    >
                      {busy ? "Gözləyin…" : "Yadda saxla"}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-stone-500">Hələ slayd yoxdur — əlavə edin və ya migrasiya seed-ini yoxlayın.</p>
      ) : null}
    </div>
  );
}
