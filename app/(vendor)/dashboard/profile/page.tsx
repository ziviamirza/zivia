"use client";

import { useCallback, useEffect, useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ensureSellerRowForUser } from "@/lib/ensure-seller-row";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

type SellerRow = {
  id: number;
  name: string;
  description: string | null;
  whatsapp: string | null;
  instagram: string | null;
  tiktok: string | null;
  avatar: string | null;
};

export default function SellerProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const baseId = useId();

  const [seller, setSeller] = useState<SellerRow | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!avatarFile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAvatarPreview(null);
      return;
    }
    const u = URL.createObjectURL(avatarFile);
    setAvatarPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [avatarFile]);

  const load = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    let { data, error } = await supabase
      .from("sellers")
      .select("id, name, description, whatsapp, instagram, tiktok, avatar")
      .eq("user_id", user.id)
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!data && !error) {
      await ensureSellerRowForUser(supabase, user);
      const again = await supabase
        .from("sellers")
        .select("id, name, description, whatsapp, instagram, tiktok, avatar")
        .eq("user_id", user.id)
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();
      data = again.data;
      error = again.error;
    }

    if (error || !data) {
      setSeller(null);
      setLoading(false);
      return;
    }

    const row = data as SellerRow;
    setSeller(row);
    setName(row.name ?? "");
    setDescription(row.description ?? "");
    setWhatsapp(row.whatsapp ?? "");
    setInstagram(row.instagram ?? "");
    setTiktok(row.tiktok ?? "");
    setLoading(false);
  }, [router, supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function handleSave() {
    setMessage("");
    if (!seller) return;
    const n = name.trim();
    if (!n) {
      setMessage("Brend / satıcı adı boş ola bilməz.");
      return;
    }

    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login");
      setSaving(false);
      return;
    }

    let avatarUrl: string | null = seller.avatar;

    if (avatarFile) {
      if (!avatarFile.type.startsWith("image/")) {
        setMessage("Avatar üçün yalnız şəkil faylı seçin.");
        setSaving(false);
        return;
      }
      if (avatarFile.size > MAX_FILE_BYTES) {
        setMessage(`Şəkil çox böyükdür (max ${formatFileSize(MAX_FILE_BYTES)}).`);
        setSaving(false);
        return;
      }
      const ext =
        (avatarFile.name.split(".").pop() || "jpg")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `${user.id}/avatar-${Date.now()}-${crypto.randomUUID().slice(0, 6)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("product-images")
        .upload(path, avatarFile, {
          contentType: avatarFile.type || "image/jpeg",
          upsert: false,
        });
      if (upErr) {
        setMessage(
          "Avatar yüklənmədi. Faylı yoxlayın və ya bir az sonra yenidən cəhd edin.",
        );
        setSaving(false);
        return;
      }
      const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
      avatarUrl = pub.publicUrl;
    }

    const wa = whatsapp.replace(/\D/g, "");

    const { error } = await supabase
      .from("sellers")
      .update({
        name: n,
        description: description.trim() || null,
        whatsapp: wa || null,
        instagram: instagram.trim() || null,
        tiktok: tiktok.trim() || null,
        avatar: avatarUrl || null,
      })
      .eq("id", seller.id);

    if (error) {
      setMessage("Dəyişikliklər saxlanılmadı. Məlumatları yoxlayıb yenidən cəhd edin.");
    } else {
      setMessage("");
      setAvatarFile(null);
      await load();
      router.refresh();
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-neutral-600">Yüklənir…</p>
      </main>
    );
  }

  if (!seller) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <p className="text-neutral-700">Satıcı profili tapılmadı.</p>
        <Link href="/dashboard" className="mt-4 inline-block text-amber-800 underline">
          Panelə qayıt
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-xl">
        <nav className="text-sm text-neutral-500">
          <Link href="/dashboard" className="font-medium text-amber-800 hover:underline">
            ← Satıcı paneli
          </Link>
        </nav>

        <header className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-800/80">
            Profil
          </p>
          <h1 className="mt-2 text-3xl font-bold text-neutral-900">Vitrin profiliniz</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Alıcıların gördüyü ad, təsvir və əlaqə kanalları. WhatsApp üçün yalnız
            rəqəmlər saxlanır (ölkə kodu ilə).
          </p>
        </header>

        <div className="zivia-panel mt-8 space-y-5 p-6 sm:p-8">
          <div>
            <label htmlFor={`${baseId}-name`} className="text-sm font-medium text-neutral-800">
              Brend / satıcı adı <span className="text-red-600">*</span>
            </label>
            <input
              id={`${baseId}-name`}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="zivia-input mt-2"
            />
          </div>

          <div>
            <label htmlFor={`${baseId}-desc`} className="text-sm font-medium text-neutral-800">
              Təsvir
            </label>
            <textarea
              id={`${baseId}-desc`}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="zivia-input mt-2 w-full resize-y"
              placeholder="Kimisiniz, nə hazırlayırsınız, sifariş necə qəbul olunur…"
            />
          </div>

          <div>
            <label htmlFor={`${baseId}-wa`} className="text-sm font-medium text-neutral-800">
              WhatsApp (yalnız rəqəm, ölkə kodu ilə)
            </label>
            <input
              id={`${baseId}-wa`}
              type="tel"
              inputMode="numeric"
              placeholder="994501234567"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="zivia-input mt-2"
            />
          </div>

          <div>
            <label htmlFor={`${baseId}-ig`} className="text-sm font-medium text-neutral-800">
              Instagram (tam link)
            </label>
            <input
              id={`${baseId}-ig`}
              type="url"
              placeholder="https://instagram.com/..."
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="zivia-input mt-2"
            />
          </div>

          <div>
            <label htmlFor={`${baseId}-tt`} className="text-sm font-medium text-neutral-800">
              TikTok (tam link)
            </label>
            <input
              id={`${baseId}-tt`}
              type="url"
              placeholder="https://tiktok.com/@..."
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value)}
              className="zivia-input mt-2"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-neutral-800">Profil şəkli</p>
            <p className="mt-1 text-xs text-neutral-500">
              Qalereyadan seçin (max {formatFileSize(MAX_FILE_BYTES)}). Boş buraxsanız,
              hazırkı şəkil saxlanır.
            </p>
            <input
              type="file"
              accept="image/*"
              className="mt-2 block w-full text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-amber-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-amber-900"
              onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
            />
            {(avatarPreview || seller.avatar) && (
              <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarPreview || seller.avatar || ""}
                  alt="Profil önizləməsi"
                  className="mx-auto h-32 w-32 rounded-full object-cover"
                />
              </div>
            )}
          </div>

          {message ? (
            <p className="text-sm text-red-700" role="alert">
              {message}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="zivia-btn-primary w-full rounded-2xl"
          >
            {saving ? "Saxlanılır…" : "Dəyişiklikləri saxla"}
          </button>
        </div>
      </div>
    </main>
  );
}
