import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Məxfilik siyasəti",
  description:
    "Zivia platformasında şəxsi məlumatların toplanması, istifadəsi və qorunması haqqında məxfilik siyasəti.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <div className="zivia-surface p-7 sm:p-10">
      <h1 className="font-display text-3xl text-stone-900">Məxfilik siyasəti</h1>

      <p className="mt-6 text-sm leading-relaxed text-stone-600">
        Zivia platformasına xoş gəlmisiniz.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-stone-600">
        Bu məxfilik siyasəti Zivia (bundan sonra &quot;platforma&quot;) tərəfindən
        istifadəçilərin şəxsi məlumatlarının necə toplandığını, istifadə
        edildiyini və qorunduğunu izah edir.
      </p>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-stone-900">1. Toplanan məlumatlar</h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          Biz aşağıdakı məlumatları toplaya bilərik:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-600">
          <li>E-poçt ünvanı</li>
          <li>Satıcı tərəfindən təqdim edilən məlumatlar (brend adı, əlaqə məlumatları)</li>
          <li>Texniki məlumatlar (IP ünvanı, brauzer tipi və s.)</li>
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-stone-600">
          Satıcı profili və məhsul səhifələrində özünüz yerləşdirdiyiniz məlumatlar
          (təsvir, əlaqə, sosial şəbəkə keçidləri, şəkillər) alıcılar üçün ictimai
          görünə bilər. Bu məlumatları paylaşmazdan əvvəl diqqətlə düşünün.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-stone-900">2. Məlumatların istifadəsi</h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          Toplanan məlumatlar aşağıdakı məqsədlərlə istifadə olunur:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-600">
          <li>Hesab yaratmaq və idarə etmək</li>
          <li>Platformanın funksionallığını təmin etmək</li>
          <li>İstifadəçi təcrübəsini yaxşılaşdırmaq</li>
          <li>Texniki problemləri həll etmək</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-stone-900">3. Üçüncü tərəflər</h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          Zivia platforması istifadəçilər arasında əlaqəni təmin edən vasitədir.
          Biz satıcılar və alıcılar arasında baş verən alış-veriş prosesinə birbaşa
          müdaxilə etmirik.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-stone-900">4. Məlumatların paylaşılması</h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          Biz istifadəçi məlumatlarını üçüncü tərəflərlə paylaşmırıq, istisna:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-600">
          <li>qanuni tələb olduqda</li>
          <li>xidmətin işləməsi üçün zəruri hallarda</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-stone-900">5. Təhlükəsizlik</h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          Məlumatların qorunması üçün müasir texnologiyalardan istifadə olunur,
          lakin internet üzərindən ötürülən məlumatların tam təhlükəsizliyinə
          zəmanət verilmir.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-stone-900">6. İstifadəçi hüquqları</h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          İstifadəçi öz məlumatlarını dəyişdirmək və ya silmək üçün bizimlə əlaqə
          saxlaya bilər.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-stone-900">7. Dəyişikliklər</h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          Bu siyasət zaman-zaman yenilənə bilər.
        </p>
      </section>

      <p className="mt-10 text-xs text-stone-500">
        Son yenilənmə tarixi: 15 aprel 2026
      </p>

      <p className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <Link href="/terms" className="font-medium text-amber-800 underline underline-offset-2">
          İstifadə şərtləri
        </Link>
        <Link href="/" className="text-amber-800 underline underline-offset-2">
          Ana səhifə
        </Link>
      </p>
      </div>
    </main>
  );
}
