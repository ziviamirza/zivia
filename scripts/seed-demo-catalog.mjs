/**
 * Demo vitrin: 10 satıcı + 30 məhsul (hər satıcıya 3 məhsul).
 *
 * Lokal: .env.local → NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY → npm run seed:demo
 * GitHub: repo Settings → Secrets → həmin iki dəyər; `main`-ə push olanda workflow avtomatik seed edir.
 *
 * Təkrar: əvvəlki `zivia-demo-*` satıcı/məhsul təmizlənir, sonra yenidən yazılır.
 */

import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function loadEnvLocal() {
  const p = join(ROOT, ".env.local");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL və SUPABASE_SERVICE_ROLE_KEY lazımdır (.env.local və ya env).");
  process.exit(1);
}

const svc = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function slugifyAz(input) {
  let s = String(input ?? "")
    .trim()
    .toLowerCase();
  const map = { ə: "e", ü: "u", ö: "o", ğ: "g", ş: "s", ç: "c", ı: "i" };
  for (const [k, v] of Object.entries(map)) s = s.split(k).join(v);
  s = s.replace(/\s+/g, "-");
  s = s.replace(/[^a-z0-9-]/g, "");
  s = s.replace(/-+/g, "-");
  s = s.replace(/^-+|-+$/g, "");
  return s || "satici";
}

/** Vitrində category sahəsi bu tam mətnlərlə uyğun olmalıdır (data/categories.ts). */
const CATEGORY_NAMES = [
  "Sırqalar",
  "Boyunbağılar",
  "Üzüklər",
  "Qolbağılar",
  "Dəstlər",
  "Minimal bijuteriya",
  "Kristal və daşlı",
  "İnci",
  "Halka sırqalar",
  "Çokerlər",
  "Pandantlar",
  "Bilərziklər",
  "Rose gold ton",
  "Statement",
  "Vintage üslub",
];

const JEWELRY_IMGS = [
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1515562141217-29e0b6b7e476?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1603561591418-84359e9ae6c2?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1599643478518-a784e5c4fac7?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1602751584552-8a43f44c9a64?auto=format&fit=crop&w=900&q=80",
];

const AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&w=400&q=80",
];

const DEMO_SHOPS = [
  { name: "Nərmin Bijuteriya", tag: "Əl işi sırqa və boyunbağı" },
  { name: "Gülüş Accessory", tag: "Gündəlik minimal seçimlər" },
  { name: "Bakı İnci Evi", tag: "İnci və klassik tonlar" },
  { name: "Minimal Touch Baku", tag: "İncə qızıl tonları" },
  { name: "Sahil Charm Studio", tag: "Charm və qolbağı" },
  { name: "Qızıl Nar İncəlik", tag: "Toy və xüsusi günlər" },
  { name: "Velvet Ring House", tag: "Üzük və dəstlər" },
  { name: "Luna Silver Line", tag: "Gümüş ton kolleksiya" },
  { name: "Artisan Bijoux AZ", tag: "Vintage və statement" },
  { name: "Şəfəq Bijuteriya", tag: "Hədiyyə dəstləri" },
];

const PRODUCT_TEMPLATES = [
  "Damla sırğa — zərif finiş",
  "Laylı boyunbağı — rose gold ton",
  "İncə klips sırğa dəsti",
  "Minimal üzük — gündəlik ölçü",
  "Kristal pandant zəncir ilə",
  "Halka sırğa orta ölçü",
  "Çoker — yumşaq örgü",
  "Qatlanan üzük üçlüsü",
  "Anklet incə zəncir",
  "Hədiyyə qutusunda dəst",
  "Sintetik inci boyunbağı",
  "Statement üzük böyük daş",
  "Stud sırğa paslanmayan örtük",
  "Bilərzik yumşaq əyilir",
  "Charm bilərzik — seçilmiş charm",
  "Vintage üslublu broş",
  "Geometrik asılı sırğa",
  "Uzun zəncir iki pandant",
  "Saç klipsi incə daş",
  "Toy dəsti — sadə liniya",
  "Kişi üçün minimal bilərzik",
  "Uşaq ölçüsü studs",
  "Rainbow kristal sırğa",
  "Bohem üslublu qolbağı",
  "Gümüş ton infinity üzük",
  "İkiləmə boyunbağı dəsti",
  "Xüsusi gün üçün dəst",
  "İfadəli çoker metal qarışığı",
  "Nano ölçülü stud dəsti",
  "Üçqat laylı üzük",
  "Damla pandant qısa zəncir",
  "Muncuq əllə düzəldilmiş qolbağı",
  "Klassik halka gümüş",
  "İsti çəhrayı üzük dəsti",
  "Şüşə daşlı üzük",
  "Uzun saç zənciri",
  "Minimal bilərzik qızıl ton",
  "Kristal broş incə iynə",
  "Akoya tipli inci sırğa",
  "Üç mərmər tonlu dəst",
];

async function cleanupDemo() {
  const { data: sellers, error: lsErr } = await svc
    .from("sellers")
    .select("id,user_id")
    .like("slug", "zivia-demo-%");

  if (lsErr) {
    console.warn("Demo satıcı axtarışı:", lsErr.message);
    return;
  }

  const ids = (sellers ?? []).map((r) => r.id);
  const userIds = [...new Set((sellers ?? []).map((r) => r.user_id).filter(Boolean))];

  if (ids.length) {
    await svc.from("products").delete().in("seller_id", ids);
    for (const tbl of ["seller_analytics_events", "admin_notifications"]) {
      const { error } = await svc.from(tbl).delete().in("seller_id", ids);
      if (error) console.warn(`cleanup ${tbl}:`, error.message);
    }
    await svc.from("sellers").delete().in("id", ids);
  }

  for (const uid of userIds) {
    const { error } = await svc.auth.admin.deleteUser(String(uid));
    if (error && !String(error.message).toLowerCase().includes("not found")) {
      console.warn("Auth silinmədi:", uid, error.message);
    }
  }

  if (ids.length) console.log("Əvvəlki demo təmizləndi:", ids.length, "satıcı");
}

async function main() {
  await cleanupDemo();

  const sellersInserted = [];

  for (let i = 0; i < DEMO_SHOPS.length; i++) {
    const shop = DEMO_SHOPS[i];
    const email = `zivia-demo-seller-${i}@seed.zivia.invalid`;
    const password = crypto.randomBytes(16).toString("hex");

    const { data: authData, error: authErr } = await svc.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {},
    });

    if (authErr || !authData?.user?.id) {
      console.error(`Auth yaradılmadı (${email}):`, authErr?.message ?? "unknown");
      process.exit(1);
    }

    const userId = authData.user.id;
    const baseSlug = slugifyAz(shop.name);
    const slug = `zivia-demo-${baseSlug}-${String(i).padStart(2, "0")}`;
    const wa = `+99450${String(7000000 + i).slice(-7)}`;

    const row = {
      user_id: userId,
      name: shop.name,
      slug,
      description: `${shop.tag}. Zivia vitrinində nümayiş üçün demo məzmun.`,
      whatsapp: wa,
      instagram: "",
      tiktok: "",
      avatar: AVATARS[i % AVATARS.length],
      approval_status: "approved",
    };

    const { data: sel, error: sErr } = await svc.from("sellers").insert(row).select("id").single();

    if (sErr || !sel) {
      console.error("Satıcı insert:", sErr?.message);
      await svc.auth.admin.deleteUser(userId);
      process.exit(1);
    }

    sellersInserted.push({ id: sel.id, slug });
    console.log("Satıcı:", shop.name, "→", slug);
  }

  let p = 0;
  for (let si = 0; si < sellersInserted.length; si++) {
    const sellerId = sellersInserted[si].id;
    for (let j = 0; j < 3; j++) {
      const title = PRODUCT_TEMPLATES[p % PRODUCT_TEMPLATES.length];
      const cat = CATEGORY_NAMES[p % CATEGORY_NAMES.length];
      const img = JEWELRY_IMGS[p % JEWELRY_IMGS.length];
      const slug =
        `zivia-demo-mehsul-${si}-${j}-` + crypto.randomBytes(4).toString("hex");
      const price = 12 + ((p * 7) % 180) + (p % 5) * 0.99;
      const desc =
        "Demo məhsul — real satış deyil. Şəkil və mətn nümunə xarakterlidir. WhatsApp ilə satıcıya yazmaq mümkündür.";

      const { error: insErr } = await svc.from("products").insert({
        title: `${title} (${cat})`,
        description: desc,
        price: Math.round(price * 100) / 100,
        category: cat,
        image: img,
        images: [img],
        slug,
        seller_id: sellerId,
        is_published: true,
        stock_quantity: 5 + (p % 15),
      });

      if (insErr) {
        console.error("Məhsul insert:", insErr.message);
        process.exit(1);
      }
      p++;
    }
  }

  console.log("\nHazırdır: 10 demo satıcı, 30 məhsul. Ana səhifə və /products bir neçə dəqiqə ərzində yenilənə bilər (ISR).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
