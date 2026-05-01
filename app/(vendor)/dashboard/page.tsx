import { redirect } from "next/navigation";
import Link from "next/link";
import { DeleteProductButton } from "@/components/DeleteProductButton";
import { primaryProductImageUrl } from "@/lib/product-images";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: seller, error: sellerError } = await supabase
    .from("sellers")
    .select("id, name, slug, user_id, whatsapp, description, avatar, approval_status, review_note")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!seller) {
    return (
      <main className="min-h-screen bg-white px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold">Satıcı profili tapılmadı</h1>
          <p className="mt-3 max-w-xl text-neutral-600">
            Bu hesabla hələ satıcı vitrini bağlayan profil yoxdur. Əgər təzə
            qeydiyyatdan keçmisinizsə, e-poçt təsdiqini tamamlayın; köhnə
            hesabdırsa, yenidən satıcı qeydiyyatından keçməyə cəhd edin və ya
            dəstəklə əlaqə saxlayın.
          </p>
          {sellerError ? (
            <p className="mt-3 text-sm text-red-700">
              Müvəqqəti texniki çətinlik ola bilər. Bir az sonra yenidən yoxlayın.
            </p>
          ) : null}
        </div>
      </main>
    );
  }

  if (seller.approval_status !== "approved") {
    return (
      <main className="min-h-screen bg-white px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h1 className="text-2xl font-bold text-amber-900">Müraciətiniz yoxlanılır</h1>
          <p className="mt-3 text-sm text-amber-900/90">
            Satıcı profiliniz admin yoxlamasındadır. Təsdiqdən sonra panel tam aktiv olacaq.
          </p>
          {seller.approval_status === "rejected" ? (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Müraciət statusu: <strong>rejected</strong>
              {seller.review_note ? ` — ${seller.review_note}` : ""}
            </p>
          ) : null}
          <p className="mt-4 text-xs text-amber-800">Status: {seller.approval_status ?? "pending"}</p>
        </div>
      </main>
    );
  }

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("seller_id", seller.id)
    .order("id", { ascending: false });

  const since = new Date();
  since.setDate(since.getDate() - 30);
  const { data: evRows, error: evErr } = await supabase
    .from("seller_analytics_events")
    .select("event_type, product_id")
    .eq("seller_id", seller.id)
    .gte("created_at", since.toISOString());

  type PerProduct = { views: number; wa: number };
  const statsByProductId = new Map<number, PerProduct>();
  let profileViews30: number | null = null;
  let totalProductViews30 = 0;
  let totalWhatsappClicks30 = 0;

  function bumpProduct(pid: number, key: keyof PerProduct) {
    let row = statsByProductId.get(pid);
    if (!row) {
      row = { views: 0, wa: 0 };
      statsByProductId.set(pid, row);
    }
    row[key]++;
  }

  if (!evErr) {
    let profileViews = 0;
    const rows = Array.isArray(evRows) ? evRows : [];
    for (const r of rows) {
      const t = (r as { event_type?: string }).event_type;
      const pidRaw = (r as { product_id?: number | null }).product_id;
      const pid = pidRaw != null && Number.isFinite(Number(pidRaw)) ? Number(pidRaw) : null;

      if (t === "product_view" && pid != null) {
        totalProductViews30++;
        bumpProduct(pid, "views");
      } else if (t === "whatsapp_click" && pid != null) {
        totalWhatsappClicks30++;
        bumpProduct(pid, "wa");
      } else if (t === "seller_profile_view") profileViews++;
    }
    profileViews30 = profileViews;
  }

  const productCount = products?.length ?? 0;
  const vitrinSlug = typeof seller.slug === "string" ? seller.slug : "";
  const waMissing =
    !seller.whatsapp ||
    String(seller.whatsapp).replace(/\D/g, "").length < 5;
  const sellerAvatar =
    typeof seller.avatar === "string" && seller.avatar.trim()
      ? seller.avatar.trim()
      : "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=900&q=80";

  const productRows = (products ?? []) as Array<{
    id: number;
    title: string | null;
    category: string | null;
    price: number | null;
    slug: string | null;
    image?: string | null;
    images?: unknown;
    is_published?: boolean | null;
    stock_quantity?: number | null;
  }>;

  const activeListings = productRows.filter(
    (p) => (p.is_published ?? true) && Number(p.stock_quantity ?? 0) > 0,
  ).length;

  const fmtAzn = (n: number) =>
    new Intl.NumberFormat("az-AZ", {
      style: "currency",
      currency: "AZN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <main className="min-h-screen px-3 py-4 md:px-4 md:py-6">
      <div className="mx-auto max-w-[1400px]">
        {waMissing ? (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 sm:px-5">
            <span className="font-semibold">WhatsApp nömrəsi əlavə edin.</span>{" "}
            Alıcılar məhsul səhifəsindən sizə yaza bilməsi üçün{" "}
            <Link href="/dashboard/profile" className="font-semibold underline">
              Profil
            </Link>{" "}
            bölməsində nömrə qeyd edin.
          </div>
        ) : null}

        <div className="mb-3 flex flex-col justify-between gap-2 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-3xl leading-none text-stone-900 md:text-5xl">
              Satıcı Dashboard
            </h1>
            <p className="mt-2 text-lg text-stone-700 md:text-2xl">
              {seller.name} - Butik Mağaza
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {vitrinSlug ? (
              <Link href={`/sellers/${vitrinSlug}`} className="app-btn-primary h-11 px-5">
                Vitrinə bax
              </Link>
            ) : null}
            <Link
              href="/dashboard/new-product"
              className="inline-flex h-11 items-center rounded-xl border border-[#d8c7ab] bg-white px-5 text-sm font-semibold text-stone-800 transition hover:bg-[#f8f2e8]"
            >
              Məhsul əlavə et
            </Link>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[290px_minmax(380px,1.1fr)_minmax(380px,1fr)]">
          <section className="app-surface p-3">
            <div className="overflow-hidden rounded-2xl border border-[#e4d5bd]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sellerAvatar}
                alt={seller.name}
                className="h-40 w-full object-cover"
              />
            </div>
            <div className="-mt-8 flex justify-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border-4 border-[var(--zivia-warm-white)] bg-[#d8be88] text-xl font-semibold text-white shadow-sm">
                {seller.name?.slice(0, 1).toUpperCase() ?? "S"}
              </div>
            </div>
            <div className="mt-2 text-center">
              <h2 className="text-2xl font-bold text-stone-900">{seller.name}</h2>
              <p className="mt-1 text-sm text-stone-500">
                {seller.description || "Premium zərgərlik satıcısı"}
              </p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link
                href={vitrinSlug ? `/sellers/${vitrinSlug}` : "/products"}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-[#b08a42] px-3 text-sm font-semibold text-white transition hover:bg-[#8b6b2c]"
              >
                İzlə
              </Link>
              <Link
                href="/dashboard/profile"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[#d4c4aa] bg-white px-3 text-sm font-semibold text-stone-800 transition hover:bg-[#f7f0e3]"
              >
                Əlaqə
              </Link>
            </div>
          </section>

          <section className="app-surface p-3">
            <h2 className="font-display text-3xl leading-none text-stone-900">
              Statistika
            </h2>
            <p className="mt-2 text-xs text-stone-500">
              Son 30 gün — vitrin baxışı və WhatsApp klikləri (real hadisələr).
            </p>

            <div className="mt-4 space-y-1 rounded-xl border border-[#e3d6c2] bg-[#fdf9f1] p-3 text-base text-stone-800">
              <div className="flex items-center justify-between gap-2">
                <span>Məhsul baxışı</span>
                <span className="font-semibold tabular-nums">
                  {evErr ? "—" : totalProductViews30}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>WhatsApp klikləri</span>
                <span className="font-semibold tabular-nums">
                  {evErr ? "—" : totalWhatsappClicks30}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>Profil baxışı</span>
                <span className="font-semibold tabular-nums">
                  {evErr ? "—" : (profileViews30 ?? 0)}
                </span>
              </div>
              <div className="mt-2 border-t border-[#e8dac5] pt-2" />
              <div className="flex items-center justify-between gap-2">
                <span>Aktiv vitrin</span>
                <span className="font-semibold tabular-nums">{activeListings}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>Məhsul cəmi</span>
                <span className="font-semibold tabular-nums">{productCount}</span>
              </div>
            </div>

            <Link
              href="/dashboard/profile"
              className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#b08a42] px-4 text-sm font-semibold text-white transition hover:bg-[#8b6b2c]"
            >
              Profili redaktə et
            </Link>
          </section>

          <section className="app-surface p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-display text-3xl leading-none text-stone-900">
                Məhsullar ({productCount})
              </h2>
              <Link
                href="/cart"
                className="inline-flex h-10 items-center rounded-xl bg-[#b08a42] px-4 text-sm font-semibold text-white transition hover:bg-[#8b6b2c]"
              >
                Səbətə qayıt
              </Link>
            </div>

            {productCount === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#dcc9a6] bg-[#fff9ef] px-4 py-8 text-center">
                <p className="text-lg font-semibold text-stone-900">
                  Hələ məhsul əlavə etməmisiniz
                </p>
                <p className="mt-1 text-sm text-stone-600">
                  Məhsullarınızı əlavə edin — baxış və WhatsApp statistikası burada görünəcək.
                </p>
                <Link href="/dashboard/new-product" className="app-btn-primary mt-4 px-5">
                  İlk məhsulu əlavə et
                </Link>
              </div>
            ) : (
              <div className="grid gap-2 md:grid-cols-2">
                {productRows.slice(0, 6).map((product) => {
                  const pid = Number(product.id);
                  const per =
                    profileViews30 !== null && !evErr
                      ? (statsByProductId.get(pid) ?? { views: 0, wa: 0 })
                      : { views: 0, wa: 0 };
                  const price = Number(product.price ?? 0);
                  const pub = product.is_published !== false;
                  const sq = Number(product.stock_quantity ?? 0);
                  const imageUrl = primaryProductImageUrl(product);
                  return (
                    <article
                      key={product.id}
                      className="rounded-xl border border-[#e4d5bd] bg-[#fffdfa] p-2.5"
                    >
                      <div className="relative overflow-hidden rounded-lg border border-[#eadfcf] bg-[#f5efe5]">
                        {!pub || sq <= 0 ? (
                          <div className="pointer-events-none absolute left-2 top-2 z-10 flex flex-wrap gap-1">
                            {!pub ? (
                              <span className="rounded-md bg-neutral-800/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                                Gizli
                              </span>
                            ) : null}
                            {sq <= 0 ? (
                              <span className="rounded-md bg-red-700/90 px-2 py-0.5 text-[10px] font-bold text-white">
                                Stok yoxdur
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=700&q=80"}
                          alt={product.title ?? "Məhsul"}
                          className="h-28 w-full object-cover"
                        />
                      </div>
                      <div className="mt-2">
                        <p className="line-clamp-1 text-lg font-semibold leading-tight text-stone-900">
                          {product.title || "Adsız məhsul"}
                        </p>
                        <p className="text-xl font-semibold text-stone-900">{fmtAzn(price)}</p>
                        <div className="mt-1 space-y-0.5 text-sm text-stone-800">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-stone-600">Baxış (30 g.)</span>
                            <span className="font-semibold tabular-nums">
                              {evErr ? "—" : per.views}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-stone-600">WhatsApp</span>
                            <span className="font-semibold tabular-nums">
                              {evErr ? "—" : per.wa}
                            </span>
                          </div>
                        </div>
                        <Link
                          href={`/dashboard/products/${product.id}/edit`}
                          className="mt-2 inline-flex h-9 w-full items-center justify-center rounded-lg border border-[#ddceb6] bg-white text-sm font-semibold text-stone-800 transition hover:bg-[#f8f2e8]"
                        >
                          Redaktə et
                        </Link>
                        <DeleteProductButton productId={Number(product.id)} />
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {evErr ? (
              <p className="mt-3 text-xs text-neutral-400">
                Statistika üçün əvvəlcə analitika SQL migration-larını tətbiq edin.
              </p>
            ) : null}
          </section>
        </div>

        {sellerError ? (
          <p className="mt-3 text-xs text-red-700">
            Müvəqqəti texniki çətinlik var. Panel məlumatları tam görünməyə bilər.
          </p>
        ) : null}
      </div>
    </main>
  );
}
