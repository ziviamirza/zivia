"use client";

import { useState } from "react";
import Link from "next/link";
import { authErrorToAz } from "@/lib/auth-user-message";
import { createClient } from "@/lib/supabase/client";

const previewItems = [
  {
    title: "Ulduzlu Boyunbağı",
    image:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=300&q=80",
  },
  {
    title: "Brilliant Üzük",
    image:
      "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=300&q=80",
  },
  {
    title: "Diamond Bracelet",
    image:
      "https://images.unsplash.com/photo-1601821765780-754fa98637c1?auto=format&fit=crop&w=300&q=80",
  },
] as const;

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(() => {
    if (typeof window === "undefined") return "";
    const p = new URLSearchParams(window.location.search);
    if (p.get("registered") === "1") {
      return "Qeydiyyat tamamlandı. E‑poçt və şifrənizlə daxil ola bilərsiniz.";
    }
    if (p.get("error") === "auth") {
      return "Giriş əməliyyatı tamamlanmadı. Bir daha cəhd edin və ya şifrəni bərpa edin.";
    }
    return "";
  });

  async function handleLogin() {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(authErrorToAz(error.message));
    } else {
      const params = new URLSearchParams(window.location.search);
      const next = params.get("next");
      const target =
        next && next.startsWith("/") && !next.startsWith("//")
          ? next
          : "/dashboard";
      window.location.assign(target);
    }

    setLoading(false);
  }

  return (
    <main className="zivia-auth-wrap">
      <div className="w-full rounded-[28px] border border-[#e3d7c3] bg-[var(--zivia-cream)] p-3 shadow-[0_20px_46px_-28px_rgba(77,55,20,0.42)] md:p-4">
        <div className="grid gap-3 lg:grid-cols-[0.95fr_1fr]">
          <section className="app-surface p-3 md:p-4">
            <h1 className="font-display text-4xl leading-none text-stone-900 md:text-5xl">
              Giriş
            </h1>

            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_0.92fr]">
              <div className="rounded-2xl border border-[#e1d4be] bg-[#fffcf6] p-3">
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  E-mail
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="zivia-input h-11"
                />

                <label className="mb-1 mt-3 block text-sm font-medium text-stone-700">
                  Şifrə
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="Şifrə"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="zivia-input h-11"
                />
              </div>

              <div className="rounded-2xl border border-[#e1d4be] bg-[#fffcf6] p-3">
                <h2 className="text-center font-display text-3xl text-stone-900 md:text-[2rem]">
                  Social Giriş
                </h2>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#d9c9ad] bg-white text-xl text-stone-500"
                    aria-label="Google ilə giriş"
                  >
                    G
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#d9c9ad] bg-white text-xl text-stone-500"
                    aria-label="Facebook ilə giriş"
                  >
                    f
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#d9c9ad] bg-white text-xl text-stone-500"
                    aria-label="Apple ilə giriş"
                  >
                    a
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={loading}
                  className="app-btn-primary mt-4 w-full justify-center text-base"
                >
                  {loading ? "Daxil olunur..." : "Giriş et"}
                </button>
                <div className="mt-3 text-center">
                  <Link href="/forgot-password" className="text-base text-stone-700 hover:underline">
                    Şifrəmi unuttum?
                  </Link>
                </div>
                <Link
                  href="/register"
                  className="mt-3 app-btn-secondary h-11 w-full justify-center text-base"
                >
                  Satıcı qeydiyyatı
                </Link>
              </div>
            </div>

            {message ? (
              <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                {message}
              </p>
            ) : null}
          </section>

          <section className="app-surface p-3 md:p-4">
            <h2 className="font-display text-3xl leading-none text-stone-900 md:text-4xl">
              Zivia-da satıcı ol
            </h2>
            <p className="mt-1 text-sm text-stone-600 md:text-base">
              Öz brend vitrinini qurmaq və məhsullarını satmaq üçün sürətli qeydiyyat.
            </p>

            <div className="mt-4 space-y-2">
              {previewItems.map((item) => (
                <article
                  key={item.title}
                  className="flex items-center gap-2 rounded-xl border border-[#e4d8c4] bg-[#fffdfa] p-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-12 w-12 rounded-lg border border-[#e7dbc8] object-cover"
                  />
                  <p className="text-sm font-medium leading-tight text-stone-900">
                    {item.title}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-4 space-y-2 text-sm text-stone-700">
              <p>✓ Ad & Soyad</p>
              <p>✓ Mağaza / brend adı</p>
              <p>✓ Satıcı e-mail və şifrə</p>
            </div>

            <Link
              href="/register"
              className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#b08a42] px-4 text-base font-semibold text-white transition hover:bg-[#8b6b2c]"
            >
              Satıcı qeydiyyatına keç
            </Link>
            <p className="mt-3 text-center text-sm text-stone-600">Zivia — Soft Luxury Marketplace</p>
          </section>
        </div>
      </div>
    </main>
  );
}
