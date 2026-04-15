"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SellerNotificationsBell from "@/components/SellerNotificationsBell";
import { createClient } from "@/lib/supabase/client";

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="m21 21-4.4-4.4M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20.3c-.3 0-.6-.1-.8-.3l-1.8-1.6c-3.8-3.5-6.2-5.7-6.2-8.5A5 5 0 0 1 8.2 5c1.5 0 3 .7 3.8 1.8A5 5 0 0 1 15.8 5a5 5 0 0 1 5 4.9c0 2.8-2.4 5-6.2 8.5L12.8 20c-.2.2-.5.3-.8.3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 8a7 7 0 0 0-14 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 4h2.2c.8 0 1.4.5 1.6 1.3L7.5 8m0 0h12.2l-1.3 5.3c-.2.8-.9 1.4-1.7 1.4H9.2c-.8 0-1.5-.6-1.7-1.4L6 7m1.5 1 1.1 5M10 20a1.2 1.2 0 1 0 0-2.4A1.2 1.2 0 0 0 10 20Zm7 0a1.2 1.2 0 1 0 0-2.4A1.2 1.2 0 0 0 17 20Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Navbar() {
  const supabase = createClient();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSignedIn(Boolean(data.session?.user));
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session?.user));
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-amber-100/80 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-display text-[1.9rem] leading-none text-stone-900">
            Zivia
          </Link>

          <div className="hidden min-w-0 flex-1 items-center gap-2 rounded-full border border-amber-100 bg-[var(--zivia-warm-white)] px-3 py-2 text-sm text-stone-500 md:flex">
            <SearchIcon className="h-4 w-4 text-stone-400" />
            Search jewelry...
          </div>

          <div className="ml-auto flex items-center gap-1.5 text-stone-600">
            <Link
              href="/products"
              className="rounded-full p-2 transition hover:bg-amber-50 hover:text-amber-700"
              aria-label="Məhsullar"
            >
              <SearchIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/products"
              className="rounded-full p-2 transition hover:bg-amber-50 hover:text-amber-700"
              aria-label="Sevimlilər"
            >
              <HeartIcon className="h-4 w-4" />
            </Link>
            <Link
              href={signedIn ? "/dashboard/profile" : "/login"}
              className="rounded-full p-2 transition hover:bg-amber-50 hover:text-amber-700"
              aria-label="Profil"
            >
              <UserIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/products"
              className="rounded-full p-2 transition hover:bg-amber-50 hover:text-amber-700"
              aria-label="Səbət"
            >
              <CartIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <nav className="flex min-w-0 flex-1 items-center gap-5 overflow-x-auto text-sm font-medium text-stone-600 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link href="/" className="shrink-0 transition hover:text-amber-800">
              Ana səhifə
            </Link>
            <Link href="/products" className="shrink-0 transition hover:text-amber-800">
              Kolleksiyalar
            </Link>
            {signedIn ? (
              <Link
                href="/dashboard"
                className="shrink-0 transition hover:text-amber-800"
              >
                Panel
              </Link>
            ) : (
              <Link
                href="/login"
                className="shrink-0 transition hover:text-amber-800"
              >
                Satıcı girişi
              </Link>
            )}
          </nav>

          {signedIn ? (
            <div className="flex items-center gap-3">
              <div className="relative z-[60] shrink-0 rounded-full border border-amber-100 bg-white p-1">
                <SellerNotificationsBell />
              </div>
              <button
                type="button"
                onClick={() => void signOut()}
                className="shrink-0 rounded-full border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-50"
              >
                Çıxış
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
