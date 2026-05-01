import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Zivia haqqında tez-tez verilən suallar.",
};

const items = [
  {
    q: "Zivia nədir?",
    a: "Zivia zərgərlik və bijuteriya satıcılarının məhsullarını vitrinləşdirdiyi marketplace-dir. Alıcılar məhsulu görür və çox vaxt WhatsApp ilə satıcıya yaza bilir.",
  },
  {
    q: "Sifarişi necə verirəm?",
    a: "Məhsul səhifəsində WhatsApp düyməsi varsa, birbaşa satıcı ilə yazışıb qiymət və çatdırılmanı razılaşdıra bilərsiniz. Səbət brauzerinizdə saxlanılır.",
  },
  {
    q: "Ödəniş saytda olur?",
    a: "Hazırda ödəniş birbaşa platforma üzərindən deyil; satıcı ilə razılaşma (adətən köçürmə və ya çatdırılmada nağd) tətbiq olunur.",
  },
  {
    q: "Satıcı necə qoşulur?",
    a: "Qeydiyyatdan keçib profilinizdə vitrin məlumatlarınızı doldurun, WhatsApp nömrəsi əlavə edin və məhsul əlavə edin.",
  },
];

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <div className="zivia-surface p-6 sm:p-8">
        <h1 className="font-display text-3xl text-stone-900">Tez-tez suallar</h1>
        <p className="mt-2 text-sm text-stone-600">
          Əlavə sual üçün{" "}
          <Link href="/contact" className="font-medium text-[#8b6b2c] underline">
            Əlaqə
          </Link>{" "}
          səhifəsinə baxın.
        </p>
        <dl className="mt-8 space-y-6">
          {items.map((item) => (
            <div key={item.q}>
              <dt className="font-semibold text-stone-900">{item.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-stone-600">{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </main>
  );
}
