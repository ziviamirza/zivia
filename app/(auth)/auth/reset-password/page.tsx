"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const MIN_LEN = 8;

export default function ResetPasswordPage() {
  const supabase = createClient();
  const [sessionOk, setSessionOk] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancel = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancel) setSessionOk(Boolean(data.session?.user));
    });
    return () => {
      cancel = true;
    };
  }, [supabase]);

  async function handleSubmit() {
    setLoading(true);
    setMessage("");

    if (password.length < MIN_LEN) {
      setMessage(`Şifrə ən azı ${MIN_LEN} simvol olmalıdır.`);
      setLoading(false);
      return;
    }
    if (password !== confirm) {
      setMessage("Şifrələr uyğun gəlmir.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(
        "Şifrə yenilənmədi. Link köhnə və ya müddəti bitmiş ola bilər. Giriş səhifəsində Şifrəni unutdum ilə yenidən link istəyin.",
      );
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
  }

  if (sessionOk === false) {
    return (
      <main className="zivia-auth-wrap">
        <div className="zivia-auth-card text-center">
          <h1 className="text-xl font-bold text-neutral-900">Əvvəlcə e-poçt linki</h1>
          <p className="mt-3 text-sm text-neutral-500">
            Şifrəni dəyişmək üçün əvvəlcə e-poçtunuza gələn bərpa linkinə basın,
            sonra bu səhifəyə qayıdın.
          </p>
          <Link
            href="/forgot-password"
            className="zivia-btn-primary mt-6 rounded-2xl px-5"
          >
            Linki yenidən göndər
          </Link>
          <p className="mt-6 text-sm text-neutral-500">
            <Link href="/login" className="font-medium text-amber-800 hover:underline">
              Girişə qayıt
            </Link>
          </p>
        </div>
      </main>
    );
  }

  if (sessionOk === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-4">
        <p className="text-sm text-neutral-500">Yüklənir…</p>
      </main>
    );
  }

  if (done) {
    return (
      <main className="zivia-auth-wrap">
        <div className="mx-auto max-w-md rounded-[2rem] border border-emerald-200 bg-emerald-50/85 p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-emerald-900">Şifrə yeniləndi</h1>
          <p className="mt-3 text-sm text-emerald-800">
            İndi yeni şifrənizlə daxil ola bilərsiniz.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard"
              className="zivia-btn-primary rounded-2xl px-6"
            >
              Satıcı paneli
            </Link>
            <Link
              href="/login"
              className="inline-flex rounded-2xl border border-emerald-300 px-6 py-3 text-sm font-semibold text-emerald-900 hover:bg-emerald-100/50"
            >
              Giriş səhifəsi
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="zivia-auth-wrap">
      <div className="zivia-auth-card">
        <p className="zivia-section-eyebrow">Təhlükəsizlik</p>
        <h1 className="mt-3 font-display text-[2rem] text-neutral-900">Yeni şifrə</h1>
        <p className="mt-2 text-sm text-neutral-500">
          E-poçtdakı linkə basdıqdan sonra aşağıda yeni şifrə təyin edin.
        </p>

        <div className="mt-6 space-y-4">
          <input
            type="password"
            autoComplete="new-password"
            placeholder={`Yeni şifrə (min. ${MIN_LEN} simvol)`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="zivia-input"
          />
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Şifrəni təkrarlayın"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="zivia-input"
          />
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={loading}
            className="zivia-btn-primary w-full rounded-2xl"
          >
            {loading ? "Yenilənir…" : "Şifrəni saxla"}
          </button>
        </div>

        {message ? (
          <p className="mt-4 text-sm text-red-700" role="alert">
            {message}
          </p>
        ) : null}

        <p className="mt-8 text-center text-sm text-neutral-500">
          <Link href="/login" className="font-medium text-amber-800 hover:underline">
            Girişə qayıt
          </Link>
        </p>
      </div>
    </main>
  );
}
