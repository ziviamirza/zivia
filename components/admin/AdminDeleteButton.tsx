"use client";

import { useState } from "react";

type Props = {
  actionLabel: string;
  confirmText: string;
  endpoint: string;
};

export default function AdminDeleteButton({ actionLabel, confirmText, endpoint }: Props) {
  const [busy, setBusy] = useState(false);

  async function run() {
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    try {
      const res = await fetch(endpoint, { method: "DELETE", credentials: "same-origin" });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        window.alert(json.error ?? `Xəta: ${res.status}`);
        return;
      }
      window.location.reload();
    } catch {
      window.alert("Şəbəkə xətası.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className="rounded-lg border border-red-900/60 bg-red-950/50 px-2 py-1 text-[11px] font-semibold text-red-200 transition hover:bg-red-900/60 disabled:opacity-50"
      disabled={busy}
      onClick={() => void run()}
    >
      {busy ? "…" : actionLabel}
    </button>
  );
}
