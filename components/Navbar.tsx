"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import SellerNotificationsBell from "@/components/SellerNotificationsBell";
import { readCartLines, subscribeCart } from "@/lib/cart-storage";
import { favoriteCount, subscribeFavorites } from "@/lib/favorites-storage";
import { createClient } from "@/lib/supabase/client";

function IconButton({
  children,
  href,
  label,
}: {
  children: React.ReactNode;
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#deceb2] bg-white text-[#7b5f2f] transition hover:bg-[#f6efe3]"
    >
      {children}
    </Link>
  );
}

function FavoritesNavButton() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const sync = () => setCount(favoriteCount());
    sync();
    return subscribeFavorites(sync);
  }, []);
  return (
    <Link
      href="/favorites"
      aria-label={count ? `Bəyəndiklərim, ${count} məhsul` : "Bəyəndiklərim"}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#deceb2] bg-white text-[#7b5f2f] transition hover:bg-[#f6efe3]"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 21s-6.5-4.35-9-8.4A5.2 5.2 0 0 1 12 6a5.2 5.2 0 0 1 9 6.6C18.5 16.65 12 21 12 21Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#9a3d4a] px-1 text-[10px] font-bold leading-none text-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}

function CartNavButton() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const sync = () =>
      setCount(readCartLines().reduce((sum, line) => sum + line.qty, 0));
    sync();
    return subscribeCart(sync);
  }, []);
  return (
    <Link
      href="/cart"
      aria-label={count ? `Səbət, ${count} ədəd` : "Səbət"}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#deceb2] bg-white text-[#7b5f2f] transition hover:bg-[#f6efe3]"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 5h2l1.2 8.1a1 1 0 0 0 1 .9h8.5a1 1 0 0 0 1-.8L19 8H7.2"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="18.5" r="1.4" fill="currentColor" />
        <circle cx="16.8" cy="18.5" r="1.4" fill="currentColor" />
      </svg>
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#7a4518] px-1 text-[10px] font-bold leading-none text-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}

function DrawerItem({
  href,
  label,
  onClick,
  icon,
}: {
  href: string;
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-lg px-1 py-1.5 text-[15px] font-medium text-[#2a241b] transition hover:bg-[#f3eadb] hover:text-[#8b6b2c]"
    >
      <span className="inline-flex h-5 w-5 items-center justify-center text-[#a8843e]">{icon}</span>
      {label}
    </Link>
  );
}

export default function Navbar() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const [signedIn, setSignedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [displayName, setDisplayName] = useState("Qonaq");

  const isProductsPage = pathname?.startsWith("/products");
  const normalizedName = useMemo(() => {
    const t = displayName.trim();
    if (!t) return "Qonaq";
    return t.length > 20 ? `${t.slice(0, 20)}…` : t;
  }, [displayName]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      setSignedIn(Boolean(user));
      const brand = String(user?.user_metadata?.brand_name ?? "").trim();
      if (brand) {
        setDisplayName(brand);
      } else {
        const emailPrefix = String(user?.email ?? "").split("@")[0]?.trim();
        setDisplayName(emailPrefix || "Qonaq");
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setSignedIn(Boolean(user));
      const brand = String(user?.user_metadata?.brand_name ?? "").trim();
      if (brand) {
        setDisplayName(brand);
      } else {
        const emailPrefix = String(user?.email ?? "").split("@")[0]?.trim();
        setDisplayName(emailPrefix || "Qonaq");
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!menuOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [menuOpen]);

  function handleSearchSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = searchTerm.trim();
    if (!q) {
      router.push("/products");
      return;
    }
    router.push(`/products?q=${encodeURIComponent(q)}`);
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const settingsHref = signedIn
    ? "/dashboard/profile"
    : `/login?next=${encodeURIComponent("/dashboard/profile")}`;
  const giftCategory = encodeURIComponent("Dəstlər");

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#e5d7c0] bg-[var(--zivia-warm-white)]/95 px-3 pb-3 pt-4 backdrop-blur md:px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              aria-label="menu"
              onClick={() => setMenuOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#deceb2] bg-white text-[#7b5f2f] transition hover:bg-[#f6efe3]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
              </svg>
            </button>
            <Link href="/" className="font-display text-[1.9rem] leading-none text-[#2f2517]">
              Zivia
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <FavoritesNavButton />
            {signedIn ? (
              <div className="hidden sm:block">
                <SellerNotificationsBell />
              </div>
            ) : null}
            <IconButton href={signedIn ? "/dashboard" : "/login"} label="profile">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
                <path
                  d="M5 19c1.8-2.9 4-4.2 7-4.2s5.2 1.3 7 4.2"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </IconButton>
            <CartNavButton />
          </div>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="mt-3 flex items-center gap-2 rounded-xl border border-[#dfd1b8] bg-white px-3 py-2.5"
        >
          <svg className="h-4 w-4 text-stone-400" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
            <path d="M20 20 16.7 16.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Axtarın..."
            className="w-full bg-transparent text-sm text-stone-700 outline-none placeholder:text-stone-400"
          />
          <button type="submit" className="text-xs font-semibold text-[#8b6b2c]">
            Axtar
          </button>
        </form>

        {signedIn ? null : null}
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-[120] bg-black/28 backdrop-blur-[1px]">
          <div className="h-full w-full max-w-[320px] bg-[var(--zivia-warm-white)] p-4 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#aa8540] text-[#aa8540]">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M5 19c1.8-2.9 4-4.2 7-4.2s5.2 1.3 7 4.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                </span>
                <p className="leading-tight text-[#1f1d1b]">
                  <span className="block text-base font-medium">Xoş gəldin,</span>
                  <span className="block text-[1.45rem] font-semibold">{normalizedName}!</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="close menu"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-stone-500 hover:bg-[#f2eadc]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav className="mt-6 space-y-4 text-[#1f1d1b]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-600">Kolleksiyalar</p>
                <div className="mt-1.5 space-y-0.5">
                  <DrawerItem
                    href="/#yeni-mehsullar"
                    label="Yeni gələnlər"
                    onClick={() => setMenuOpen(false)}
                    icon={
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                      </svg>
                    }
                  />
                  <DrawerItem
                    href="/products"
                    label="Bütün məhsullar"
                    onClick={() => setMenuOpen(false)}
                    icon={
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M12 3 6 8v8l6 5 6-5V8l-6-5Z" stroke="currentColor" strokeWidth="1.7" />
                      </svg>
                    }
                  />
                  <DrawerItem
                    href={`/products?category=${giftCategory}`}
                    label="Hədiyyə dəstləri"
                    onClick={() => setMenuOpen(false)}
                    icon={
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <rect x="4" y="8" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.7" />
                        <path d="M12 8v12M4 12h16M8 8c0-1.7 1.4-3 3-3h1v3H8Zm8 0c0-1.7-1.4-3-3-3h-1v3h4Z" stroke="currentColor" strokeWidth="1.7" />
                      </svg>
                    }
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-600">Satıcılar</p>
                <div className="mt-1.5 space-y-0.5">
                  <DrawerItem
                    href="/#populyar-saticilar"
                    label="Populyar satıcılar"
                    onClick={() => setMenuOpen(false)}
                    icon={
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M5 19V10M12 19V6M19 19v-8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                      </svg>
                    }
                  />
                  <DrawerItem
                    href="/sellers"
                    label="Bütün satıcılar"
                    onClick={() => setMenuOpen(false)}
                    icon={
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M12 21s7-5.4 7-10a7 7 0 1 0-14 0c0 4.6 7 10 7 10Z" stroke="currentColor" strokeWidth="1.7" />
                        <circle cx="12" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.7" />
                      </svg>
                    }
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-600">Hesabım</p>
                <div className="mt-1.5 space-y-0.5">
                  <DrawerItem
                    href="/cart"
                    label="Səbətim"
                    onClick={() => setMenuOpen(false)}
                    icon={
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
                        <path d="M8 9h8M8 13h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                      </svg>
                    }
                  />
                  <DrawerItem
                    href="/favorites"
                    label="Bəyəndiklərim"
                    onClick={() => setMenuOpen(false)}
                    icon={
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M12 21s-6.5-4.35-9-8.4A5.2 5.2 0 0 1 12 6a5.2 5.2 0 0 1 9 6.6C18.5 16.65 12 21 12 21Z" stroke="currentColor" strokeWidth="1.7" />
                      </svg>
                    }
                  />
                  {signedIn ? (
                    <DrawerItem
                      href="/dashboard"
                      label="Satıcı paneli"
                      onClick={() => setMenuOpen(false)}
                      icon={
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path
                            d="M4 6h16v12H4zM8 10h8M8 14h5"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                          />
                        </svg>
                      }
                    />
                  ) : null}
                  <DrawerItem
                    href={settingsHref}
                    label="Ayarlar"
                    onClick={() => setMenuOpen(false)}
                    icon={
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
                        <path d="M19 12a7 7 0 0 0-.08-1l2.08-1.6-2-3.46-2.5 1a7 7 0 0 0-1.7-1L14.5 3h-4L10 5.94a7 7 0 0 0-1.7 1l-2.5-1-2 3.46L5.88 11a7 7 0 0 0 0 2L3.8 14.6l2 3.46 2.5-1a7 7 0 0 0 1.7 1l.5 2.94h4l.5-2.94a7 7 0 0 0 1.7-1l2.5 1 2-3.46L18.92 13c.05-.33.08-.66.08-1Z" stroke="currentColor" strokeWidth="1.2" />
                      </svg>
                    }
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-600">Dəstək</p>
                <div className="mt-1.5 space-y-0.5">
                  <DrawerItem
                    href="/contact"
                    label="Əlaqə"
                    onClick={() => setMenuOpen(false)}
                    icon={
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M4 6h16v12H4zM4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.7" />
                      </svg>
                    }
                  />
                  <DrawerItem
                    href="/faq"
                    label="FAQ"
                    onClick={() => setMenuOpen(false)}
                    icon={
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
                        <path d="M9.7 9.6a2.4 2.4 0 1 1 3.8 2c-.86.62-1.5 1-1.5 2.1M12 17.2h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                      </svg>
                    }
                  />
                </div>
              </div>
            </nav>

            <div className="mt-6">
              {signedIn ? (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    void signOut();
                  }}
                  className="inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-[#ebdfc8] px-4 text-base font-semibold text-[#2c2419]"
                >
                  Çıxış
                </button>
              ) : (
                <Link
                  onClick={() => setMenuOpen(false)}
                  href="/login"
                  className="inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-[#ebdfc8] px-4 text-base font-semibold text-[#2c2419]"
                >
                  Giriş
                </Link>
              )}
            </div>
          </div>
          <button
            type="button"
            aria-label="close overlay"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 -z-10"
          />
        </div>
      ) : null}
    </>
  );
}
