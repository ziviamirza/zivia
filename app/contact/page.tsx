import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Əlaqə",
  description: "Zivia ilə əlaqə və dəstək.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <div className="zivia-surface p-6 sm:p-8">
        <h1 className="font-display text-3xl text-stone-900">Əlaqə</h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          Suallarınız və təklifləriniz üçün platformanın şərtləri və məxfilik sənədlərində
          göstərilən kanallardan istifadə edin, və ya birbaşa dəstək üçün e-poçt ünvanınızı
          təqdim edən satıcı ilə vitrin üzərindən əlaqə saxlayın.
        </p>
        <ul className="mt-6 space-y-2 text-sm">
          <li>
            <Link href="/terms" className="font-medium text-[#8b6b2c] underline">
              İstifadə şərtləri
            </Link>
          </li>
          <li>
            <Link href="/privacy" className="font-medium text-[#8b6b2c] underline">
              Məxfilik siyasəti
            </Link>
          </li>
          <li>
            <Link href="/faq" className="font-medium text-[#8b6b2c] underline">
              Tez-tez verilən suallar
            </Link>
          </li>
        </ul>
      </div>
    </main>
  );
}
