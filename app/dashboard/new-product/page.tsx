"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { slugifyAz } from "@/lib/slugify";
import { categories } from "@/data/categories";
import { MAX_PRODUCT_GALLERY_IMAGES } from "@/lib/product-images";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_TITLE_LEN = 140;
const MAX_DESC_LEN = 5000;
const CATEGORY_OTHER = "__digər__";

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

export default function NewProductPage() {
  const supabase = createClient();
  const router = useRouter();
  const baseId = useId();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [stockQty, setStockQty] = useState("1");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState("");
  const [approvalWarning, setApprovalWarning] = useState("");

  const titleId = `${baseId}-title`;
  const descId = `${baseId}-desc`;
  const priceId = `${baseId}-price`;
  const catId = `${baseId}-category`;
  const customCatId = `${baseId}-custom-category`;
  const fileInputId = `${baseId}-file`;
  const stockId = `${baseId}-stock`;

  const previewEntries = useMemo(
    () => files.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    [files],
  );

  useEffect(() => {
    return () => {
      for (const p of previewEntries) {
        URL.revokeObjectURL(p.url);
      }
    };
  }, [previewEntries]);

  const addImageFiles = useCallback((incoming: File[]) => {
    setFieldErrors((e) => ({ ...e, image: undefined }));
    setGeneralError("");
    if (!incoming.length) return;

    setFiles((prev) => {
      const next: File[] = [...prev];
      const errs: string[] = [];

      for (const f of incoming) {
        if (next.length >= MAX_PRODUCT_GALLERY_IMAGES) {
          errs.push(`Ən çox ${MAX_PRODUCT_GALLERY_IMAGES} şəkil əlavə edə bilərsiniz.`);
          break;
        }
        if (!f.type.startsWith("image/")) {
          errs.push(`"${f.name}" şəkil formatında deyil.`);
          continue;
        }
        if (f.size > MAX_FILE_BYTES) {
          errs.push(`"${f.name}" çox böyükdür (max ${formatFileSize(MAX_FILE_BYTES)}).`);
          continue;
        }
        next.push(f);
      }

      if (errs.length) {
        const msg = errs.slice(0, 3).join(" ");
        queueMicrotask(() => {
          setFieldErrors((e) => ({ ...e, image: msg }));
        });
      }
      return next;
    });
  }, []);

  function removeFileAt(index: number) {
    setFieldErrors((e) => ({ ...e, image: undefined }));
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function clearAllImages() {
    setFieldErrors((e) => ({ ...e, image: undefined }));
    setFiles([]);
  }

  function validateForm(): FieldErrors | null {
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
      err.price = "Düzgün qiymət daxil edin (məs: 45 və ya 29.99).";
    else if (priceNum > 999_999)
      err.price = "Qiymət çox böyükdür — yoxlayın.";

    let categoryName = "";
    if (!categoryId) err.category = "Kateqoriya seçin.";
    else if (categoryId === CATEGORY_OTHER) {
      categoryName = customCategory.trim();
      if (!categoryName) err.category = "“Digər” üçün kateqoriya adı yazın.";
      else if (categoryName.length > 80)
        err.category = "Kateqoriya adı çox uzundur (max 80 simvol).";
    } else {
      const found = categories.find((c) => c.id === categoryId);
      categoryName = found?.name ?? "";
      if (!categoryName) err.category = "Etibarlı kateqoriya seçin.";
    }

    if (!files.length) err.image = "Ən azı bir şəkil seçin (bir neçə foto əlavə edə bilərsiniz).";

    const st = stockQty.trim();
    if (st === "") err.stock = "Stok sayı yazın (0 ola bilər).";
    else if (!/^\d+$/.test(st)) err.stock = "Yalnız tam ədəd (məs: 0, 1, 5).";
    else {
      const n = Number(st);
      if (n > 999_999) err.stock = "Stok çox böyükdür.";
    }

    return Object.keys(err).length ? err : null;
  }

  async function handleSubmit() {
    setGeneralError("");
    setApprovalWarning("");
    const err = validateForm();
    if (err) {
      setFieldErrors(err);
      return;
    }
    setFieldErrors({});

    const rawPrice = price.replace(",", ".").trim();
    const priceNum = Number(rawPrice);
    const categoryName =
      categoryId === CATEGORY_OTHER
        ? customCategory.trim()
        : (categories.find((c) => c.id === categoryId)?.name ?? "");

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setGeneralError("Əvvəlcə daxil olun.");
      setLoading(false);
      return;
    }

    const { data: seller, error: sellerFetchError } = await supabase
      .from("sellers")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (sellerFetchError) {
      setGeneralError(sellerFetchError.message);
      setLoading(false);
      return;
    }

    if (!seller) {
      setGeneralError("Bu hesab üçün satıcı profili tapılmadı.");
      setLoading(false);
      return;
    }

    if (seller.approval_status !== "approved") {
      setApprovalWarning("Profiliniz admin tərəfindən təsdiqlənməyib. Məhsul əlavə etmək üçün əvvəlcə təsdiq gözlənilir.");
      setLoading(false);
      return;
    }

    if (!files.length) {
      setLoading(false);
      return;
    }

    const uploadedPaths: string[] = [];
    const imageUrls: string[] = [];

    try {
      for (const file of files) {
        const ext =
          (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") ||
          "jpg";
        const objectPath = `${user.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
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
        imageUrls.push(pub.publicUrl);
      }
    } catch {
      if (uploadedPaths.length) {
        await supabase.storage.from("product-images").remove(uploadedPaths);
      }
      setGeneralError(
        "Şəkillərdən biri yüklənmədi. Ölçü və formatı yoxlayıb yenidən cəhd edin.",
      );
      setLoading(false);
      return;
    }

    const base = slugifyAz(title.trim());
    const slug =
      (base || "mehsul") +
      "-" +
      crypto.randomUUID().replaceAll("-", "").slice(0, 10);

    const stockNum = Number(stockQty.trim());

    const { error } = await supabase.from("products").insert({
      title: title.trim(),
      description: description.trim() || null,
      price: priceNum,
      category: categoryName,
      image: imageUrls[0] ?? null,
      images: imageUrls,
      slug,
      seller_id: seller.id,
      is_published: isPublished,
      stock_quantity: stockNum,
    });

    if (error) {
      await supabase.storage.from("product-images").remove(uploadedPaths);
      setGeneralError(
        "Məhsul saxlanılmadı. Məlumatları yoxlayıb yenidən cəhd edin. Problem davam edərsə, dəstəklə əlaqə saxlayın.",
      );
    } else {
      router.push("/dashboard");
      router.refresh();
    }

    setLoading(false);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const list = Array.from(e.dataTransfer.files ?? []).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (list.length) addImageFiles(list);
  }

  const inputClass = (hasError: boolean) =>
    `w-full rounded-2xl border px-4 py-3 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:ring-4 focus:ring-amber-100 ${
      hasError
        ? "border-red-300 bg-red-50/40 focus:border-red-400"
        : "border-amber-100 bg-white/95 focus:border-amber-300"
    }`;

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
            Yeni vitrin məhsulu
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Məhsul əlavə et
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-600 sm:text-base">
            “Vitrində göstər” işarəlidirsə, məhsul vitrin siyahılarında görünür.
            Kateqoriyanı siyahıdan seçin; uyğun yoxdursa, “Digər” ilə özünüz
            yazın.
          </p>
        </header>

        {generalError ? (
          <div
            className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
            role="alert"
          >
            {generalError}
          </div>
        ) : null}

        {approvalWarning ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {approvalWarning}
          </div>
        ) : null}

        <div className="mt-8 space-y-8">
          <section
            className="zivia-panel p-6 sm:p-8"
            aria-labelledby={`${baseId}-sec1`}
          >
            <h2
              id={`${baseId}-sec1`}
              className="text-sm font-semibold uppercase tracking-wide text-neutral-500"
            >
              1. Əsas məlumat
            </h2>

            <div className="mt-5 space-y-5">
              <div>
                <label
                  htmlFor={titleId}
                  className="flex items-baseline justify-between gap-2 text-sm font-medium text-neutral-800"
                >
                  <span>
                    Məhsul adı <span className="text-red-600">*</span>
                  </span>
                  <span className="text-xs font-normal text-neutral-400">
                    {title.length}/{MAX_TITLE_LEN}
                  </span>
                </label>
                <input
                  id={titleId}
                  type="text"
                  maxLength={MAX_TITLE_LEN}
                  autoComplete="off"
                  placeholder="Məs: İncili minimal sırğa"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setFieldErrors((x) => ({ ...x, title: undefined }));
                  }}
                  aria-invalid={Boolean(fieldErrors.title)}
                  aria-describedby={fieldErrors.title ? `${titleId}-err` : undefined}
                  className={`mt-2 ${inputClass(Boolean(fieldErrors.title))}`}
                />
                {fieldErrors.title ? (
                  <p id={`${titleId}-err`} className="mt-1.5 text-sm text-red-700">
                    {fieldErrors.title}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor={descId}
                  className="flex items-baseline justify-between gap-2 text-sm font-medium text-neutral-800"
                >
                  <span>Təsvir</span>
                  <span className="text-xs font-normal text-neutral-400">
                    {description.length}/{MAX_DESC_LEN} (istəyə bağlı)
                  </span>
                </label>
                <textarea
                  id={descId}
                  maxLength={MAX_DESC_LEN}
                  rows={5}
                  placeholder="Material, ölçü, qayğı qaydaları, çatdırılma müddəti və s."
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setFieldErrors((x) => ({ ...x, description: undefined }));
                  }}
                  aria-invalid={Boolean(fieldErrors.description)}
                  className={`mt-2 resize-y ${inputClass(Boolean(fieldErrors.description))}`}
                />
                {fieldErrors.description ? (
                  <p className="mt-1.5 text-sm text-red-700">{fieldErrors.description}</p>
                ) : null}
              </div>
            </div>
          </section>

          <section
            className="zivia-panel p-6 sm:p-8"
            aria-labelledby={`${baseId}-sec2`}
          >
            <h2
              id={`${baseId}-sec2`}
              className="text-sm font-semibold uppercase tracking-wide text-neutral-500"
            >
              2. Qiymət və kateqoriya
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label htmlFor={priceId} className="text-sm font-medium text-neutral-800">
                  Qiymət (AZN) <span className="text-red-600">*</span>
                </label>
                <input
                  id={priceId}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="29.99"
                  value={price}
                  onChange={(e) => {
                    const v = e.target.value.replace(",", ".");
                    if (v === "" || /^\d*\.?\d{0,2}$/.test(v)) {
                      setPrice(v);
                      setFieldErrors((x) => ({ ...x, price: undefined }));
                    }
                  }}
                  aria-invalid={Boolean(fieldErrors.price)}
                  className={`mt-2 ${inputClass(Boolean(fieldErrors.price))}`}
                />
                {fieldErrors.price ? (
                  <p className="mt-1.5 text-sm text-red-700">{fieldErrors.price}</p>
                ) : (
                  <p className="mt-1.5 text-xs text-neutral-500">Nöqtə ilə onluq (məs: 45.50).</p>
                )}
              </div>

              <div className="sm:col-span-1">
                <label htmlFor={catId} className="text-sm font-medium text-neutral-800">
                  Kateqoriya <span className="text-red-600">*</span>
                </label>
                <select
                  id={catId}
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setFieldErrors((x) => ({ ...x, category: undefined }));
                  }}
                  aria-invalid={Boolean(fieldErrors.category)}
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
                  <option value={CATEGORY_OTHER}>Digər (özünüz yazın)</option>
                </select>
                {categoryId === CATEGORY_OTHER ? (
                  <div className="mt-3">
                    <label htmlFor={customCatId} className="sr-only">
                      Digər kateqoriya adı
                    </label>
                    <input
                      id={customCatId}
                      type="text"
                      maxLength={80}
                      placeholder="Kateqoriya adı (vitrin filtri ilə uyğunlaşdırın)"
                      value={customCategory}
                      onChange={(e) => {
                        setCustomCategory(e.target.value);
                        setFieldErrors((x) => ({ ...x, category: undefined }));
                      }}
                      className={inputClass(Boolean(fieldErrors.category))}
                    />
                  </div>
                ) : null}
                {fieldErrors.category ? (
                  <p className="mt-1.5 text-sm text-red-700">{fieldErrors.category}</p>
                ) : (
                  <p className="mt-1.5 text-xs text-neutral-500">
                    Standart kateqoriya seçsəniz, məhsul filtrdə düzgün qrupa düşər.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section
            className="zivia-panel p-6 sm:p-8"
            aria-labelledby={`${baseId}-sec2b`}
          >
            <h2
              id={`${baseId}-sec2b`}
              className="text-sm font-semibold uppercase tracking-wide text-neutral-500"
            >
              3. Vitrin və stok
            </h2>
            <div className="mt-5 space-y-5">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-100 bg-[var(--zivia-warm-white)] px-4 py-3">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
                />
                <span>
                  <span className="text-sm font-semibold text-neutral-900">Vitrində göstər</span>
                  <span className="mt-0.5 block text-xs text-neutral-600">
                    Söndürsəniz, məhsul yalnız satıcı panelinizdə qalır; ictimai
                    siyahılarda görünməz.
                  </span>
                </span>
              </label>

              <div>
                <label htmlFor={stockId} className="text-sm font-medium text-neutral-800">
                  Stok sayı
                </label>
                <input
                  id={stockId}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="1"
                  value={stockQty}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    setStockQty(v);
                    setFieldErrors((x) => ({ ...x, stock: undefined }));
                  }}
                  aria-invalid={Boolean(fieldErrors.stock)}
                  className={`mt-2 max-w-[200px] ${inputClass(Boolean(fieldErrors.stock))}`}
                />
                {fieldErrors.stock ? (
                  <p className="mt-1.5 text-sm text-red-700">{fieldErrors.stock}</p>
                ) : (
                  <p className="mt-1.5 text-xs text-neutral-500">
                    0 = “stokda yoxdur” — vitrində gizlədilir; satıcı panelində
                    görünür.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section
            className="zivia-panel p-6 sm:p-8"
            aria-labelledby={`${baseId}-sec3`}
          >
            <h2
              id={`${baseId}-sec3`}
              className="text-sm font-semibold uppercase tracking-wide text-neutral-500"
            >
              4. Şəkillər
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Bir neçə foto seçə bilərsiniz (ən çox {MAX_PRODUCT_GALLERY_IMAGES},
              hər biri max {formatFileSize(MAX_FILE_BYTES)}). İlk şəkil vitrin
              kartında görünür.
            </p>

            <input
              id={fileInputId}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => {
                const list = Array.from(e.target.files ?? []);
                e.target.value = "";
                if (list.length) addImageFiles(list);
              }}
            />

            <button
              type="button"
              onClick={() => document.getElementById(fileInputId)?.click()}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`mt-4 flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-10 text-center transition ${
                dragActive
                  ? "border-amber-500 bg-amber-50/60"
                  : fieldErrors.image
                    ? "border-red-300 bg-red-50/30"
                    : "border-neutral-200 bg-neutral-50/50 hover:border-amber-300 hover:bg-amber-50/40"
              }`}
            >
              <span className="text-sm font-semibold text-neutral-800">
                Şəkil(lər) seç və ya buraya sürü
              </span>
              <span className="mt-1 text-xs text-neutral-500">
                JPEG · PNG · WebP · HEIC (telefon) · çox seçim
              </span>
            </button>

            {fieldErrors.image ? (
              <p className="mt-2 text-sm text-red-700" role="alert">
                {fieldErrors.image}
              </p>
            ) : null}

            {previewEntries.length ? (
              <div className="mt-6 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-600">
                  <span>
                    Seçilib: <strong className="text-neutral-900">{previewEntries.length}</strong>
                    {previewEntries.length >= MAX_PRODUCT_GALLERY_IMAGES ? (
                      <span className="ml-2 text-amber-800">(limit dolub)</span>
                    ) : null}
                  </span>
                  <button
                    type="button"
                    onClick={clearAllImages}
                    className="rounded-lg border border-neutral-200 px-2 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                  >
                    Hamısını təmizlə
                  </button>
                </div>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {previewEntries.map((entry, i) => (
                    <li
                      key={entry.url}
                      className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-neutral-200 bg-white px-3 py-2 text-[11px] text-neutral-600">
                        <span className="truncate font-medium text-neutral-800">
                          {i === 0 ? "Əsas · " : ""}
                          {entry.file.name}
                        </span>
                        <span className="shrink-0">{formatFileSize(entry.file.size)}</span>
                        <button
                          type="button"
                          onClick={() => removeFileAt(i)}
                          className="shrink-0 rounded-lg border border-neutral-200 px-2 py-0.5 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50"
                        >
                          Sil
                        </button>
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={entry.url}
                        alt=""
                        className="mx-auto max-h-48 w-full object-contain"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-neutral-500">
              <span className="text-red-600">*</span> ilə işarələnənlər vacibdir.
            </p>
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={loading}
            className="zivia-btn-primary min-h-12 w-full rounded-2xl px-8 sm:w-auto sm:min-w-[200px]"
            >
              {loading ? "Yüklənir və saxlanılır…" : "Məhsulu saxla"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
