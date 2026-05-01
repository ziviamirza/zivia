"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function Chevron() {
  return (
    <svg className="h-4 w-4 shrink-0 text-stone-400" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SettingsRow({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex w-full items-center gap-3 rounded-xl border border-transparent bg-white/60 px-3 py-3 text-left transition hover:border-[#e6dbc7] hover:bg-white hover:shadow-sm"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f3eadb] text-[#8b6b2c]">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-stone-900">{title}</span>
        <span className="mt-0.5 block text-xs leading-snug text-stone-500">{description}</span>
      </span>
      <Chevron />
    </Link>
  );
}

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSignedIn(Boolean(data.session?.user));
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(Boolean(session?.user));
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/?cixis=1");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg px-3 py-6 md:px-4 md:py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#deceb2] bg-white text-[#7b5f2f] transition hover:bg-[#f6efe3]"
          aria-label="Ana səhifə"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M15 18 9 12l6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[#2f2517]">Ayarlar</h1>
          <p className="text-xs text-stone-500">Hesab, təhlükəsizlik və dəstək</p>
        </div>
      </div>

      {loading ? (
        <div className="app-surface space-y-3 p-4">
          <div className="h-14 animate-pulse rounded-xl bg-[#eadfcf]" />
          <div className="h-14 animate-pulse rounded-xl bg-[#eadfcf]" />
          <div className="h-14 animate-pulse rounded-xl bg-[#eadfcf]" />
        </div>
      ) : (
        <div className="space-y-6">
          <section className="app-surface p-3 md:p-4">
            <h2 className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
              Hesab
            </h2>
            <div className="space-y-1">
              {signedIn ? (
                <>
                  <SettingsRow
                    href="/dashboard/profile"
                    title="Profil və vitrin"
                    description="Mağaza adı, şəkil, WhatsApp və sosial şəbəkələr"
                    icon={
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
                        <path
                          d="M5 19c1.8-2.9 4-4.2 7-4.2s5.2 1.3 7 4.2"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                        />
                      </svg>
                    }
                  />
                  <SettingsRow
                    href="/dashboard"
                    title="Satıcı paneli"
                    description="Məhsullar, statistika və bildirişlər"
                    icon={
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                          d="M4 6h16v12H4zM8 10h8M8 14h5"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                        />
                      </svg>
                    }
                  />
                  <SettingsRow
                    href="/dashboard/new-product"
                    title="Yeni məhsul"
                    description="Vitrinə əlavə et"
                    icon={
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                      </svg>
                    }
                  />
                </>
              ) : (
                <>
                  <SettingsRow
                    href={`/login?next=${encodeURIComponent("/settings")}`}
                    title="Giriş"
                    description="Mövcud hesabla daxil olun"
                    icon={
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                          d="M15 3h4v18h-4M10 17l5-5-5-5M15 12H3"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    }
                  />
                  <SettingsRow
                    href="/register"
                    title="Qeydiyyat"
                    description="Yeni satıcı hesabı yaradın"
                    icon={
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                          d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8-6v6M21 8h-6"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                        />
                      </svg>
                    }
                  />
                </>
              )}
            </div>
          </section>

          <section className="app-surface p-3 md:p-4">
            <h2 className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
              Alış-veriş
            </h2>
            <div className="space-y-1">
              <SettingsRow
                href="/cart"
                title="Səbət"
                description="Seçilmiş məhsullar və sifarişə hazırlıq"
                icon={
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
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
                }
              />
              <SettingsRow
                href="/favorites"
                title="Bəyəndiklərim"
                description="Sonra almaq istədiyiniz məhsullar"
                icon={
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M12 21s-6.5-4.35-9-8.4A5.2 5.2 0 0 1 12 6a5.2 5.2 0 0 1 9 6.6C18.5 16.65 12 21 12 21Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                  </svg>
                }
              />
            </div>
          </section>

          <section className="app-surface p-3 md:p-4">
            <h2 className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
              Təcrübə
            </h2>
            <div className="space-y-1">
              <div className="flex items-center gap-3 rounded-xl border border-[#ebe3d4] bg-[#faf6ef] px-3 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f3eadb] text-[#8b6b2c]">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M12 16v-1M12 8v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-stone-900">Dil</span>
                  <span className="mt-0.5 block text-xs text-stone-500">İnterfeys dili</span>
                </span>
                <span className="rounded-full border border-[#d9ccb5] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#6b5428]">
                  Azərbaycan
                </span>
              </div>
            </div>
          </section>

          <section className="app-surface p-3 md:p-4">
            <h2 className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
              Hüquqi və dəstək
            </h2>
            <div className="space-y-1">
              <SettingsRow
                href="/privacy"
                title="Məxfilik siyasəti"
                description="Şəxsi məlumatların işlənməsi"
                icon={
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M12 3 5 7v6c0 5 3.5 9 7 10 3.5-1 7-5 7-10V7l-7-4Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                    <path d="M9 12h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                }
              />
              <SettingsRow
                href="/terms"
                title="İstifadə şərtləri"
                description="Xidmət qaydaları və məsuliyyət"
                icon={
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M7 4h10a2 2 0 0 1 2 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 0 1 2-2Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />
              <SettingsRow
                href="/faq"
                title="Tez-tez verilən suallar"
                description="Ödəniş, çatdırılma və hesab"
                icon={
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
                    <path
                      d="M9.7 9.6a2.4 2.4 0 1 1 3.8 2c-.86.62-1.5 1-1.5 2.1M12 17.2h.01"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                }
              />
              <SettingsRow
                href="/contact"
                title="Əlaqə"
                description="Komanda ilə yazışın"
                icon={
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M4 6h16v12H4zM4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.7" />
                  </svg>
                }
              />
            </div>
          </section>

          {signedIn ? (
            <button
              type="button"
              onClick={() => void signOut()}
              className="app-btn-secondary w-full justify-center border-[#e8d4c4] py-3 text-[#7a3d32]"
            >
              Hesabdan çıxış
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
