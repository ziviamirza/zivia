"use client";

import { useState } from "react";

export default function AdminLoginForm({
  nextPath,
  defaultEmail,
}: {
  nextPath: string;
  defaultEmail: string;
}) {
  const [email, setEmail] = useState(defaultEmail);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
        credentials: "same-origin",
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Giriş alınmadı.");
        return;
      }
      window.location.href = nextPath;
    } catch {
      setError("Şəbəkə xətası.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="admin-email" className="text-xs font-medium text-stone-600">
          E-poçt
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="app-input mt-1"
          required
        />
      </div>
      <div>
        <label htmlFor="admin-code" className="text-xs font-medium text-stone-600">
          Xüsusi kod
        </label>
        <input
          id="admin-code"
          type="password"
          autoComplete="current-password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="app-input mt-1"
          required
        />
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button type="submit" disabled={loading} className="app-btn-primary w-full justify-center py-3">
        {loading ? "Yoxlanır…" : "Daxil ol"}
      </button>
    </form>
  );
}
