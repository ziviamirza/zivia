"use client";

import { useState } from "react";

type Props = {
  endpoint: string;
  status: "approved" | "rejected";
  label: string;
  confirmText: string;
};

export default function AdminSellerApprovalButton({ endpoint, status, label, confirmText }: Props) {
  const [busy, setBusy] = useState(false);

  async function run() {
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "same-origin",
      });
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
      className={[
        "rounded-lg border px-2 py-1 text-[11px] font-semibold transition disabled:opacity-50",
        status === "approved"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
      ].join(" ")}
      disabled={busy}
      onClick={() => void run()}
    >
      {busy ? "…" : label}
    </button>
  );
}
