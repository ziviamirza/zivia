"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAuthEmailRedirectWithNext } from "@/lib/auth-email-redirect";
import { recoverPasswordErrorToAz } from "@/lib/auth-user-message";
import { createClient } from "@/lib/supabase/client";

const COOLDOWN_AFTER_429_MS = 90_000;

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!cooldownUntil) return;
    const id = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= cooldownUntil) {
        setCooldownUntil(null);
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [cooldownUntil]);

  const cooldownLeftSec =
    cooldownUntil && cooldownUntil > now
      ? Math.ceil((cooldownUntil - now) / 1000)
      : 0;

  async function handleSubmit() {
    setLoading(true);
    setMessage("");
    const trimmed = email.trim();
    if (!trimmed) {
      setMessage("E-poçt ünvanını daxil edin.");
      setLoading(false);
      return;
    }

    const redirectTo = getAuthEmailRedirectWithNext("/auth/reset-password");

    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo,
    });

    if (error) {
      setMessage(recoverPasswordErrorToAz(error));
      if (error.status === 429) {
        setCooldownUntil(Date.now() + COOLDOWN_AFTER_429_MS);
      }
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <main className="zivia-auth-wrap">
      <div className="zivia-auth-card">
        <p className="zivia-section-eyebrow">Şifrə yenilənməsi</p>
        <h1 className="mt-3 font-display text-[2rem] text-neutral-900">
          Şifrəni bərpa edin
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Qeydiyyatda istifadə etdiyiniz e-poçtu daxil edin. Bu ünvanda hesab
          varsa, şifrəni yeniləmək üçün təhlükəsiz link göndəriləcək.
        </p>

        {sent ? (
          <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            Əgər bu ünvanla hesab varsa, e-poçtunuza link göndərildi. Gələn
            qovluğu və spam qovluğunu da yoxlayın.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            <input
              type="email"
              autoComplete="email"
              placeholder="E-poçt"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            className="zivia-input"
            />
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={loading || cooldownLeftSec > 0}
            className="zivia-btn-primary w-full rounded-2xl"
            >
              {loading
                ? "Göndərilir…"
                : cooldownLeftSec > 0
                  ? `Gözləyin (${cooldownLeftSec}s)`
                  : "Link göndər"}
            </button>
          </div>
        )}

        {message ? (
          <p className="mt-4 text-sm text-red-700" role="alert">
            {message}
          </p>
        ) : null}

        <p className="mt-8 text-center text-sm text-neutral-500">
          <Link href="/login" className="font-medium text-amber-800 hover:underline">
            Girişə qayıt
          </Link>
          {" · "}
          <Link href="/register" className="font-medium text-amber-800 hover:underline">
            Qeydiyyat
          </Link>
        </p>
      </div>
    </main>
  );
}
