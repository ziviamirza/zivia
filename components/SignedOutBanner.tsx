"use client";

import { useEffect, useLayoutEffect, useState } from "react";

export default function SignedOutBanner() {
  const [open, setOpen] = useState(false);

  useLayoutEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("cixis") !== "1") return;
    setOpen(true);
    url.searchParams.delete("cixis");
    const q = url.searchParams.toString();
    window.history.replaceState(null, "", `${url.pathname}${q ? `?${q}` : ""}${url.hash}`);
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => setOpen(false), 6000);
    return () => window.clearTimeout(t);
  }, [open]);

  if (!open) return null;

  return (
    <div className="border-b border-emerald-200/80 bg-emerald-50 px-3 py-2.5 text-center md:px-4" role="status">
      <p className="text-sm font-medium text-emerald-900">Çıxış edildi.</p>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="mt-1 text-xs font-semibold text-emerald-800 underline decoration-emerald-600/50 underline-offset-2 hover:text-emerald-950"
      >
        Bağla
      </button>
    </div>
  );
}
