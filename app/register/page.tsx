"use client";

import { useState } from "react";
import Link from "next/link";
import { getAuthEmailRedirectWithNext } from "@/lib/auth-email-redirect";
import { authErrorToAz } from "@/lib/auth-user-message";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleRegister() {
    setLoading(true);
    setMessage("");

    if (!fullName.trim()) {
      setMessage("Ad və soyad daxil edin.");
      setLoading(false);
      return;
    }

    if (!brandName.trim()) {
      setMessage("Mağaza / brend adı daxil edin.");
      setLoading(false);
      return;
    }

    if (!acceptedLegal) {
      setMessage("Davam etmək üçün məxfilik siyasəti və istifadə şərtlərini qəbul edin.");
      setLoading(false);
      return;
    }

    const acceptedAt = new Date().toISOString();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthEmailRedirectWithNext("/dashboard"),
        data: {
          full_name: fullName.trim(),
          brand_name: brandName.trim(),
          terms_and_privacy_accepted_at: acceptedAt,
        },
      },
    });

    if (error) {
      setMessage(authErrorToAz(error.message));
      setLoading(false);
      return;
    }

    if (!data.user) {
      setMessage("İstifadəçi yaradılmadı.");
      setLoading(false);
      return;
    }

    // Uğurlu qeydiyyat - istifadəçini login səhifəsinə yönləndir
    const params = new URLSearchParams();
    params.set("registered", "1");
    window.location.assign(`/login?${params.toString()}`);
  }

  return (
    <main className="zivia-auth-wrap">
      <div className="zivia-auth-card">
        <p className="zivia-section-eyebrow">Satıcı qeydiyyatı</p>
        <h1 className="mt-3 font-display text-[2rem] text-neutral-900">
          Zivia vitrininə qoşulun
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Brendinizi zərif bir marketplace-də təqdim edin və alıcılarla birbaşa
          əlaqə yaradın.
        </p>

        <div className="mt-6 space-y-4">
          <input
            type="text"
            autoComplete="name"
            placeholder="Ad və soyad"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="zivia-input"
          />
          <input
            type="text"
            autoComplete="organization"
            placeholder="Mağaza / brend adı"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            className="zivia-input"
          />
          <input
            type="email"
            autoComplete="email"
            placeholder="Satıcı e-poçtu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="zivia-input"
          />
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Şifrə"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="zivia-input"
          />

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/40 p-4 text-sm leading-snug text-neutral-700">
            <input
              type="checkbox"
              checked={acceptedLegal}
              onChange={(e) => {
                setAcceptedLegal(e.target.checked);
                setMessage("");
              }}
              className="mt-1 h-4 w-4 shrink-0 rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
            />
            <span>
              <Link
                href="/privacy"
                className="font-semibold text-amber-900 underline underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                Məxfilik siyasəti
              </Link>
              {" və "}
              <Link
                href="/terms"
                className="font-semibold text-amber-900 underline underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                İstifadə şərtləri
              </Link>
              ilə tanış oldum və qəbul edirəm.
            </span>
          </label>

          <button
            type="button"
            onClick={handleRegister}
            disabled={loading}
            className="zivia-btn-primary w-full rounded-2xl"
          >
            {loading ? "Hesab yaradılır…" : "Satıcı hesabı yarat"}
          </button>

          <p className="rounded-2xl border border-amber-100 bg-amber-50/50 px-4 py-3 text-sm text-neutral-600">
            Bu qeydiyyat yalnız satıcılar üçündür.
          </p>

          {message ? (
            <p
              className={
                message.includes("yaradıldı") || message.includes("Hesab yaradıldı")
                  ? "text-sm text-emerald-800"
                  : "text-sm text-red-700"
              }
              role={message.includes("yaradıldı") ? undefined : "alert"}
            >
              {message}
            </p>
          ) : null}
        </div>

        <p className="mt-8 text-center text-sm text-neutral-500">
          Artıq hesabınız var?{" "}
          <Link href="/login" className="font-medium text-amber-800 hover:underline">
            Giriş
          </Link>
        </p>
      </div>
    </main>
  );
}
