import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "İstifadə şərtləri",
  description: "Zivia platformasından istifadə şərtləri və satıcı öhdəlikləri.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <div className="zivia-surface p-7 sm:p-10">
      <h1 className="font-display text-3xl text-stone-900">İstifadə şərtləri</h1>

      <p className="mt-6 text-sm leading-relaxed text-stone-600">
        Zivia platformasından istifadə etməklə siz aşağıdakı şərtlərlə razılaşırsınız.
      </p>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-stone-900">1. Platformanın rolu</h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          Zivia müxtəlif bijuteriya satıcılarını bir araya gətirən platformadır.
          Platforma birbaşa satış həyata keçirmir və yalnız vasitəçi rolunu oynayır.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-stone-900">2. Satıcı məsuliyyəti</h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          Platformada yerləşdirilən məhsullara görə bütün məsuliyyət satıcının üzərinə
          düşür:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-600">
          <li>məhsulun düzgün təqdim edilməsi</li>
          <li>qiymət</li>
          <li>keyfiyyət</li>
          <li>çatdırılma</li>
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-stone-600">
          Satıcı olaraq vitrin və məhsul səhifələrində yerləşdirdiyiniz mətn, qiymət,
          şəkil və digər materialların düzgünlüyü, yenilikliliyi və hüquqi cəhətdən
          icazəli olması sizin öhdəliyinizdədir. Başqalarının müəllif hüquqlu və ya
          şəxsi məlumatlarını icazəsiz paylaşmayın; aldadıcı və ya qanunsuz reklamdan
          çəkinin. Platforma bu məzmunu yalnız texniki olaraq göstərir.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-stone-900">3. Alıcı məsuliyyəti</h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          Alıcı məhsulu almadan əvvəl bütün məlumatları yoxlamalıdır. Zivia alıcı ilə
          satıcı arasında yaranan mübahisələrə görə məsuliyyət daşımır.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-stone-900">4. Qadağan olunan fəaliyyətlər</h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          İstifadəçilərə aşağıdakılar qadağandır:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-600">
          <li>saxta məlumat yerləşdirmək</li>
          <li>digər istifadəçiləri aldatmaq</li>
          <li>platformadan qeyri-qanuni məqsədlərlə istifadə etmək</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-stone-900">5. Hesabın dayandırılması</h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          Qaydaların pozulması halında platforma istifadəçi hesabını məhdudlaşdıra və
          ya silə bilər.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-stone-900">6. Məsuliyyətin məhdudlaşdırılması</h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          Zivia platforması vasitəsilə həyata keçirilən əməliyyatlara görə məsuliyyət
          daşımır.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-stone-900">7. Dəyişikliklər</h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          Platforma istənilən vaxt bu şərtləri dəyişmək hüququna malikdir.
        </p>
      </section>

      <p className="mt-10 text-xs text-stone-500">
        Son yenilənmə tarixi: 15 aprel 2026
      </p>

      <p className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <Link href="/privacy" className="font-medium text-amber-800 underline underline-offset-2">
          Məxfilik siyasəti
        </Link>
        <Link href="/" className="text-amber-800 underline underline-offset-2">
          Ana səhifə
        </Link>
      </p>
      </div>
    </main>
  );
}
