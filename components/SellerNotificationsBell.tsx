"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Row = {
  id: number;
  type: string;
  title: string;
  body: string | null;
  href: string | null;
  read_at: string | null;
  created_at: string;
};

function typeLabel(type: string): string {
  switch (type) {
    case "product":
      return "Məhsul";
    case "buyer":
      return "Alıcı";
    case "promo":
      return "Xəbər";
    default:
      return "Sistem";
  }
}

/** Cədvəl yoxdursa / REST 404 */
function isNotificationsTableMissing(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  if (err.code === "PGRST205" || err.code === "42P01") return true;
  const m = (err.message || "").toLowerCase();
  return (
    m.includes("could not find the table") ||
    m.includes("does not exist") ||
    m.includes("schema cache") ||
    m.includes("seller_notifications")
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "İndi";
  if (mins < 60) return `${mins} dəq əvvəl`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} saat əvvəl`;
  return d.toLocaleDateString("az-AZ", { day: "numeric", month: "short" });
}

function viewportHeight(): number {
  if (typeof window === "undefined") return 0;
  return window.visualViewport?.height ?? window.innerHeight;
}

export default function SellerNotificationsBell() {
  const supabase = createClient();
  const [items, setItems] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableMissing, setTableMissing] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    if (tableMissing) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("seller_notifications")
        .select("id, type, title, body, href, read_at, created_at")
        .order("created_at", { ascending: false })
        .limit(40);

      if (error && isNotificationsTableMissing(error)) {
        setTableMissing(true);
        setItems([]);
        return;
      }

      if (!error && Array.isArray(data)) {
        setItems(data as Row[]);
      } else {
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  }, [supabase, tableMissing]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void load();
    });
    return () => subscription.unsubscribe();
  }, [supabase, load]);

  useEffect(() => {
    if (tableMissing) return;
    const id = window.setInterval(() => void load(), 45_000);
    return () => window.clearInterval(id);
  }, [load, tableMissing]);

  const syncPanelPosition = useCallback(() => {
    const btn = buttonRef.current;
    const panel = panelRef.current;
    if (!btn || !panel) return;

    const margin = 10;
    const maxPanelW = 22 * 16;
    const r = btn.getBoundingClientRect();
    const vh = viewportHeight();
    const vw = typeof window !== "undefined" ? window.innerWidth : 0;

    const width = Math.min(maxPanelW, vw - margin * 2);
    let left = r.right - width;
    left = Math.max(margin, Math.min(left, vw - width - margin));

    const top = r.bottom + margin;
    const maxHeight = Math.max(140, vh - top - margin);

    panel.style.top = `${top}px`;
    panel.style.left = `${left}px`;
    panel.style.width = `${width}px`;
    panel.style.maxHeight = `${maxHeight}px`;
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    syncPanelPosition();
    const ro =
      typeof ResizeObserver !== "undefined" && buttonRef.current
        ? new ResizeObserver(() => syncPanelPosition())
        : null;
    ro?.observe(buttonRef.current!);

    const onWin = () => syncPanelPosition();
    window.addEventListener("resize", onWin);
    window.visualViewport?.addEventListener("resize", onWin);
    window.visualViewport?.addEventListener("scroll", onWin);
    window.addEventListener("scroll", onWin, true);

    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", onWin);
      window.visualViewport?.removeEventListener("resize", onWin);
      window.visualViewport?.removeEventListener("scroll", onWin);
      window.removeEventListener("scroll", onWin, true);
    };
  }, [open, syncPanelPosition]);

  useEffect(() => {
    function onDoc(e: PointerEvent) {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      setOpen(false);
    }
    if (open) document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, [open]);

  const unread = items.filter((x) => !x.read_at).length;

  async function markRead(id: number) {
    if (tableMissing) return;
    await supabase
      .from("seller_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);
    void load();
  }

  async function markAllRead() {
    if (tableMissing) return;
    await supabase
      .from("seller_notifications")
      .update({ read_at: new Date().toISOString() })
      .is("read_at", null);
    void load();
  }

  function retryAfterSetup() {
    setTableMissing(false);
    void load();
  }

  async function onItemClick(row: Row) {
    if (!row.read_at) await markRead(row.id);
  }

  const panel =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Bildirişlər"
            className="fixed z-[200] flex min-h-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl ring-1 ring-black/5"
            style={{ top: 0, left: 0, width: 320 }}
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-neutral-100 px-4 py-3">
              <p className="text-sm font-semibold text-neutral-900">Bildirişlər</p>
              {unread > 0 ? (
                <button
                  type="button"
                  onClick={() => void markAllRead()}
                  className="shrink-0 text-xs font-medium text-amber-800 hover:underline"
                >
                  Hamısını oxunmuş et
                </button>
              ) : null}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] pb-[max(0.5rem,env(safe-area-inset-bottom))]">
              {tableMissing ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-base font-semibold text-neutral-800">Bildirişləriniz yoxdur</p>
                  <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                    Bildiriş siyahısı üçün verilənlər bazasında cədvəl lazımdır. SQL Editor-da{" "}
                    <code className="rounded bg-neutral-100 px-1 py-0.5 text-[11px]">
                      20260415220000_seller_notifications.sql
                    </code>{" "}
                    faylını işə salın.
                  </p>
                  <button
                    type="button"
                    onClick={() => retryAfterSetup()}
                    className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600"
                  >
                    Yenidən yoxla
                  </button>
                </div>
              ) : items.length > 0 ? (
                <ul className="divide-y divide-neutral-100">
                  {items.map((row) => {
                    const inner = (
                      <div
                        className={`px-4 py-3.5 text-left transition hover:bg-stone-50 ${
                          row.read_at ? "opacity-80" : "bg-amber-50/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="min-w-0 flex-1 break-words text-sm font-semibold leading-snug text-neutral-900">
                            {row.title}
                          </p>
                          <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
                            {typeLabel(row.type)}
                          </span>
                        </div>
                        {row.body ? (
                          <p className="mt-1.5 break-words text-xs leading-relaxed text-neutral-600">{row.body}</p>
                        ) : null}
                        <p className="mt-2 text-[10px] text-neutral-400">{formatTime(row.created_at)}</p>
                      </div>
                    );

                    if (row.href) {
                      return (
                        <li key={row.id}>
                          <Link href={row.href} onClick={() => void onItemClick(row)} className="block">
                            {inner}
                          </Link>
                        </li>
                      );
                    }

                    return (
                      <li key={row.id}>
                        <button type="button" className="block w-full text-left" onClick={() => void onItemClick(row)}>
                          {inner}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="px-4 py-8 text-center">
                  <p className="text-base font-semibold text-neutral-800">Bildirişləriniz yoxdur</p>
                  {loading ? (
                    <p className="mt-2 text-xs text-neutral-400">Yüklənir…</p>
                  ) : (
                    <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                      Yeni məhsul və ya digər hadisələr olanda burada görünəcək.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setOpen((wasOpen) => {
            if (!wasOpen) void load();
            return !wasOpen;
          });
        }}
        className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white text-[#7b5f2f] shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 ${
          tableMissing
            ? "border-dashed border-neutral-300 text-neutral-500 hover:bg-neutral-200/60"
            : unread > 0
              ? "border-[#e0b86e] bg-[#f7ecda] text-[#7b5f2f] hover:bg-[#f2e0c0]"
              : "border-[#deceb2] hover:bg-[#f6efe3]"
        } ${open && !tableMissing ? "ring-2 ring-amber-300/60 ring-offset-1 ring-offset-white" : ""}`}
        aria-label="Bildirişlər"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className="sr-only">Bildirişlər</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          className={`h-[21px] w-[21px] ${unread > 0 ? "drop-shadow-sm" : ""}`}
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path
            d="M8.5 3.5a3.5 3.5 0 017 0"
            opacity={unread > 0 ? 0.55 : 0.4}
            strokeWidth="1.65"
          />
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-red-600 px-1 text-[10px] font-bold text-white shadow-sm">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>
      {panel}
    </div>
  );
}
