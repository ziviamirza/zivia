"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ensureSellerRowForUser } from "@/lib/ensure-seller-row";
import { categories } from "@/data/categories";
import {
  MAX_PRODUCT_GALLERY_IMAGES,
  productRowImageUrls,
} from "@/lib/product-images";
import {
  PRODUCT_IMAGES_BUCKET,
  productImageObjectPathsForUser,
} from "@/lib/product-image-storage";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_TITLE_LEN = 140;
const MAX_DESC_LEN = 5000;
const CATEGORY_OTHER = "__digər__";

type ProductRow = {
  id: number;
  title: string;
  description: string | null;
  price: number | string;
  category: string;
  image: string | null;
  images?: unknown;
  slug: string;
  seller_id: number;
  is_published?: boolean | null;
  stock_quantity?: number | null;
};

type FieldErrors = {
  title?: string;
  description?: string;
  price?: string;
  category?: string;
  image?: string;
  stock?: string;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const baseId = useId();
  const rawId = params.id;
  const productId = typeof rawId === "string" ? Number(rawId) : NaN;

  const [product, setProduct] = useState<ProductRow | null>(null);
  const [notAllowed, setNotAllowed] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const initialImageUrlsRef = useRef<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [stockQty, setStockQty] = useState("1");

  const newFilePreviews = useMemo(
    () => newFiles.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    [newFiles],
  );

  useEffect(() => {
    return () => {
      for (const p of newFilePreviews) {
        URL.revokeObjectURL(p.url);
      }
    };
  }, [newFilePreviews]);

  const load = useCallback(async () => {
    setLoading(true);
    setNotAllowed(false);
    if (!Number.isFinite(productId) || productId < 1) {
      setProduct(null);
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login");
      return;
    }

    let { data: seller } = await supabase
      .from("sellers")
      .select("id")
      .eq("user_id", user.id)
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!seller) {
      await ensureSellerRowForUser(supabase, user);
      const again = await supabase
        .from("sellers")
        .select("id")
        .eq("user_id", user.id)
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();
      seller = again.data;
    }

    if (!seller) {
      setProduct(null);
      setLoading(false);
      return;
    }

    const { data: row, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .maybeSingle();

    if (error || !row) {
      setProduct(null);
      setLoading(false);
      return;
    }

    const p = row as ProductRow;
    if (Number(p.seller_id) !== Number(seller.id)) {
      setNotAllowed(true);
      setProduct(null);
      setLoading(false);
      return;
    }

    setProduct(p);
    const urls = productRowImageUrls(p);
    setGalleryUrls(urls);
    initialImageUrlsRef.current = [...urls];
    setNewFiles([]);
    setTitle(p.title ?? "");
    setDescription(p.description ?? "");
    setPrice(String(p.price ?? ""));

    const match = categories.find((c) => c.name === p.category);
    if (match) {
      setCategoryId(match.id);
      setCustomCategory("");
    } else {
      setCategoryId(CATEGORY_OTHER);
      setCustomCategory(p.category ?? "");
    }

    setIsPublished(p.is_published !== false);
    setStockQty(
      p.stock_quantity !== undefined && p.stock_quantity !== null
        ? String(Math.max(0, Math.floor(Number(p.stock_quantity))))
        : "1",
    );

    setLoading(false);
  }, [productId, router, supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  function addNewImageFiles(incoming: File[]) {
    setFieldErrors((e) => ({ ...e, image: undefined }));
    setGeneralError("");
    if (!incoming.length) return;

    setNewFiles((prev) => {
      const next = [...prev];
      const room =
        MAX_PRODUCT_GALLERY_IMAGES - galleryUrls.length - prev.length;
      if (room <= 0) {
        setFieldErrors((e) => ({
          ...e,
          image: `Ən çox ${MAX_PRODUCT_GALLERY_IMAGES} şəkil saxlanıla bilər.`,
        }));
        return prev;
      }

      let added = 0;
      for (const f of incoming) {
        if (added >= room) break;
        if (!f.type.startsWith("image/")) {
          setFieldErrors((e) => ({
            ...e,
            image: "Yalnız şəkil faylı seçin.",
          }));
          continue;
        }
        if (f.size > MAX_FILE_BYTES) {
          setFieldErrors((e) => ({
            ...e,
            image: `Fayl çox böyükdür (max ${formatFileSize(MAX_FILE_BYTES)}).`,
          }));
          continue;
        }
        next.push(f);
        added++;
      }
      return next;
    });
  }

  function removeGalleryUrl(url: string) {
    setFieldErrors((e) => ({ ...e, image: undefined }));
    setGalleryUrls((prev) => prev.filter((u) => u !== url));
  }

  function removeNewFileAt(index: number) {
    setFieldErrors((e) => ({ ...e, image: undefined }));
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function validate(): FieldErrors | null {
    const err: FieldErrors = {};
    const t = title.trim();
    if (!t) err.title = "Məhsul adı vacibdir.";
    else if (t.length > MAX_TITLE_LEN)
      err.title = `Maksimum ${MAX_TITLE_LEN} simvol.`;

    if (description.length > MAX_DESC_LEN) {
      err.description = `Maksimum ${MAX_DESC_LEN} simvol.`;
    }

    const rawPrice = price.replace(",", ".").trim();
    const priceNum = Number(rawPrice);
    if (!rawPrice) err.price = "Qiymət vacibdir.";
    else if (!Number.isFinite(priceNum) || priceNum < 0)
      err.price = "Düzgün qiymət daxil edin.";
    else if (priceNum > 999_999) err.price = "Qiymət çox böyükdür.";

    if (!categoryId) err.category = "Kateqoriya seçin.";
    else if (categoryId === CATEGORY_OTHER) {
      const c = customCategory.trim();
      if (!c) err.category = "“Digər” üçün kateqoriya adı yazın.";
      else if (c.length > 80) err.category = "Kateqoriya adı çox uzundur.";
    }

    const imgCount = (galleryUrls?.length ?? 0) + (newFiles?.length ?? 0);
    if (imgCount < 1) {
      err.image = "Ən azı bir şəkil saxlayın və ya yeni foto əlavə edin.";
    }

    const st = stockQty.trim();
    if (st === "") err.stock = "Stok sayı yazın (0 ola bilər).";
    else if (!/^\d+$/.test(st)) err.stock = "Yalnız tam ədəd.";
    else if (Number(st) > 999_999) err.stock = "Stok çox böyükdür.";

    return Object.keys(err).length ? err : null;
  }

  async function handleSave() {
    if (!product) return;
    setGeneralError("");
    const err = validate();
    if (err) {
      setFieldErrors(err);
      return;
    }
    setFieldErrors({});
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login");
      setSaving(false);
      return;
    }

    const rawPrice = price.replace(",", ".").trim();
    const priceNum = Number(rawPrice);
    const categoryName =
      categoryId === CATEGORY_OTHER
        ? customCategory.trim()
        : (categories.find((c) => c.id === categoryId)?.name ?? "");

    const newTitle = title.trim();
    const stockNum = Number(stockQty.trim());

    const finalUrls: string[] = [...galleryUrls];
    const uploadedPaths: string[] = [];

    try {
      for (const file of newFiles) {
        if (finalUrls.length >= MAX_PRODUCT_GALLERY_IMAGES) break;
        const ext =
          (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") ||
          "jpg";
        const objectPath = `${user.id}/${Date.now()}-edit-${crypto.randomUUID().slice(0, 8)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(objectPath, file, {
            contentType: file.type || "image/jpeg",
            upsert: false,
          });
        if (uploadError) {
          throw new Error(uploadError.message);
        }
        uploadedPaths.push(objectPath);
        const { data: pub } = supabase.storage.from("product-images").getPublicUrl(objectPath);
        finalUrls.push(pub.publicUrl);
      }

      if (finalUrls.length > MAX_PRODUCT_GALLERY_IMAGES) {
        finalUrls.length = MAX_PRODUCT_GALLERY_IMAGES;
      }

      const { error } = await supabase
        .from("products")
        .update({
          title: newTitle,
          description: description.trim() || null,
          price: priceNum,
          category: categoryName,
          images: finalUrls,
          image: finalUrls[0] ?? null,
          is_published: isPublished,
          stock_quantity: stockNum,
        })
        .eq("id", product.id);

      if (error) {
        throw new Error(error.message);
      }

      const toRemove = initialImageUrlsRef.current.filter((u) => !finalUrls.includes(u));
      const rmPaths = productImageObjectPathsForUser(toRemove, user.id);
      if (rmPaths.length) {
        await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(rmPaths);
      }

      initialImageUrlsRef.current = [...finalUrls];
      setProduct((prev) =>
        prev ? { ...prev, image: finalUrls[0] ?? null, images: finalUrls } : prev,
      );
      setGalleryUrls(finalUrls);
      setNewFiles([]);

      router.push("/dashboard");
      router.refresh();
    } catch {
      if (uploadedPaths.length) {
        await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(uploadedPaths);
      }
      setGeneralError(
        "Dəyişikliklər saxlanılmadı və ya şəkil yüklənmədi. Məlumatları yoxlayıb yenidən cəhd edin.",
      );
    }

    setSaving(false);
  }

  const inputClass = (hasError: boolean) =>
    `w-full rounded-2xl border px-4 py-3 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:ring-4 focus:ring-amber-100 ${
      hasError
        ? "border-red-300 bg-red-50/40 focus:border-red-400"
        : "border-amber-100 bg-white/95 focus:border-amber-300"
    }`;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-neutral-600">Yüklənir…</p>
      </main>
    );
  }

  if (notAllowed || !product) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <h1 className="text-xl font-bold text-neutral-900">Məhsul tapılmadı</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Bu məhsulu redaktə etmək üçün icazəniz yoxdur və ya link səhvdir.
        </p>
        <Link href="/dashboard" className="mt-6 inline-block text-amber-800 underline">
          Panelə qayıt
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <nav className="text-sm text-neutral-500">
          <Link href="/dashboard" className="font-medium text-amber-800 hover:underline">
            ← Satıcı paneli
          </Link>
        </nav>

        <header className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-800/80">
            Məhsul redaktəsi
          </p>
          <h1 className="mt-2 text-3xl font-bold text-neutral-900">Məhsulu yenilə</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Qiymət, təsvir, kateqoriya, şəkil, vitrin görünürlüyü və stoku
            dəyişə bilərsiniz. Məhsul linki (slug) eyni qalır.
          </p>
        </header>

        {generalError ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            {generalError}
          </div>
        ) : null}

        <div className="zivia-panel mt-8 space-y-6 p-6 sm:p-8">
          <div>
            <label htmlFor={`${baseId}-title`} className="text-sm font-medium text-neutral-800">
              Məhsul adı <span className="text-red-600">*</span>
            </label>
            <input
              id={`${baseId}-title`}
              type="text"
              maxLength={MAX_TITLE_LEN}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setFieldErrors((x) => ({ ...x, title: undefined }));
              }}
              className={`mt-2 ${inputClass(Boolean(fieldErrors.title))}`}
            />
            {fieldErrors.title ? (
              <p className="mt-1 text-sm text-red-700">{fieldErrors.title}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor={`${baseId}-desc`} className="text-sm font-medium text-neutral-800">
              Təsvir
            </label>
            <textarea
              id={`${baseId}-desc`}
              rows={5}
              maxLength={MAX_DESC_LEN}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setFieldErrors((x) => ({ ...x, description: undefined }));
              }}
              className={`mt-2 resize-y ${inputClass(Boolean(fieldErrors.description))}`}
            />
            {fieldErrors.description ? (
              <p className="mt-1 text-sm text-red-700">{fieldErrors.description}</p>
            ) : null}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor={`${baseId}-price`} className="text-sm font-medium text-neutral-800">
                Qiymət (AZN) <span className="text-red-600">*</span>
              </label>
              <input
                id={`${baseId}-price`}
                type="text"
                inputMode="decimal"
                value={price}
                onChange={(e) => {
                  const v = e.target.value.replace(",", ".");
                  if (v === "" || /^\d*\.?\d{0,2}$/.test(v)) {
                    setPrice(v);
                    setFieldErrors((x) => ({ ...x, price: undefined }));
                  }
                }}
                className={`mt-2 ${inputClass(Boolean(fieldErrors.price))}`}
              />
              {fieldErrors.price ? (
                <p className="mt-1 text-sm text-red-700">{fieldErrors.price}</p>
              ) : null}
            </div>
            <div>
              <label htmlFor={`${baseId}-cat`} className="text-sm font-medium text-neutral-800">
                Kateqoriya <span className="text-red-600">*</span>
              </label>
              <select
                id={`${baseId}-cat`}
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setFieldErrors((x) => ({ ...x, category: undefined }));
                }}
                className={`mt-2 ${inputClass(Boolean(fieldErrors.category))}`}
              >
                <option value="" disabled>
                  Kateqoriya seçin…
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
                <option value={CATEGORY_OTHER}>Digər</option>
              </select>
              {categoryId === CATEGORY_OTHER ? (
                <input
                  type="text"
                  maxLength={80}
                  placeholder="Kateqoriya adı"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className={`mt-2 ${inputClass(Boolean(fieldErrors.category))}`}
                />
              ) : null}
              {fieldErrors.category ? (
                <p className="mt-1 text-sm text-red-700">{fieldErrors.category}</p>
              ) : null}
            </div>
          </div>

          <div className="rounded-xl border border-amber-100 bg-[var(--zivia-warm-white)] p-4">
            <p className="text-sm font-medium text-neutral-800">Vitrin və stok</p>
            <label className="mt-3 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm text-neutral-700">Vitrində göstər (ictimai siyahılarda)</span>
            </label>
            <div className="mt-4">
              <label htmlFor={`${baseId}-stock`} className="text-sm font-medium text-neutral-800">
                Stok sayı
              </label>
              <input
                id={`${baseId}-stock`}
                type="text"
                inputMode="numeric"
                value={stockQty}
                onChange={(e) => {
                  setStockQty(e.target.value.replace(/\D/g, ""));
                  setFieldErrors((x) => ({ ...x, stock: undefined }));
                }}
                className={`mt-2 max-w-[200px] ${inputClass(Boolean(fieldErrors.stock))}`}
              />
              {fieldErrors.stock ? (
                <p className="mt-1 text-sm text-red-700">{fieldErrors.stock}</p>
              ) : (
                <p className="mt-1 text-xs text-neutral-500">0 = stokda yoxdur (vitrində gizli).</p>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-neutral-800">Şəkillər</p>
            <p className="mt-1 text-xs text-neutral-500">
              Ən çox {MAX_PRODUCT_GALLERY_IMAGES} şəkil; hər fayl max{" "}
              {formatFileSize(MAX_FILE_BYTES)}. İlk sıradakı vitrin kartında
              görünür.
            </p>
            <input
              id={`${baseId}-file`}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => {
                const list = Array.from(e.target.files ?? []);
                e.target.value = "";
                if (list.length) addNewImageFiles(list);
              }}
            />
            <button
              type="button"
              onClick={() => document.getElementById(`${baseId}-file`)?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragActive(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                const list = Array.from(e.dataTransfer.files ?? []).filter((f) =>
                  f.type.startsWith("image/"),
                );
                if (list.length) addNewImageFiles(list);
              }}
              className={`mt-3 flex w-full flex-col items-center rounded-2xl border-2 border-dashed py-8 text-sm transition ${
                dragActive
                  ? "border-amber-500 bg-amber-50/60"
                  : fieldErrors.image
                    ? "border-red-300 bg-red-50/30"
                    : "border-amber-100 bg-[var(--zivia-warm-white)]"
              }`}
            >
              Şəkil əlavə et (çox seçim və ya sürü-burax)
            </button>
            {fieldErrors.image ? (
              <p className="mt-2 text-sm text-red-700">{fieldErrors.image}</p>
            ) : null}

            {galleryUrls.length + newFiles.length > 0 ? (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {galleryUrls.map((url, i) => (
                  <li
                    key={url}
                    className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-neutral-100 bg-white px-2 py-1.5 text-[11px] text-neutral-600">
                      <span className="truncate font-medium text-neutral-800">
                        {i === 0 ? "Əsas · " : ""}
                        Mövcud {i + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeGalleryUrl(url)}
                        className="shrink-0 rounded border border-neutral-200 px-2 py-0.5 font-semibold text-neutral-700 hover:bg-neutral-50"
                      >
                        Sil
                      </button>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="mx-auto max-h-44 w-full object-contain" />
                  </li>
                ))}
                {newFilePreviews.map((entry, i) => (
                  <li
                    key={entry.url}
                    className="overflow-hidden rounded-xl border border-dashed border-amber-200 bg-amber-50/30"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-amber-100/80 bg-white px-2 py-1.5 text-[11px] text-neutral-600">
                      <span className="truncate font-medium text-neutral-800">
                        Yeni · {entry.file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeNewFileAt(i)}
                        className="shrink-0 rounded border border-neutral-200 px-2 py-0.5 font-semibold text-neutral-700 hover:bg-neutral-50"
                      >
                        Ləğv
                      </button>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={entry.url} alt="" className="mx-auto max-h-44 w-full object-contain" />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-2xl border border-amber-100 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 hover:bg-amber-50/40"
            >
              Ləğv et
            </Link>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="zivia-btn-primary rounded-2xl px-6 disabled:opacity-60"
            >
              {saving ? "Saxlanılır…" : "Yadda saxla"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
