import type { Metadata } from "next";
import Link from "next/link";
import {
  SUPPORT_WHATSAPP_DISPLAY,
  getSupportWhatsAppUrl,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Əlaqə",
  description: "Zivia ilə əlaqə və dəstək.",
};

export default function ContactPage() {
  const waPrefill = "Salam, Zivia dəstəyi ilə əlaqə saxlamaq istəyirəm.";
  const waHref = getSupportWhatsAppUrl(waPrefill);

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <div className="zivia-surface p-6 sm:p-8">
        <h1 className="font-display text-3xl text-stone-900">Əlaqə</h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          Suallarınız və təklifləriniz üçün platformanın şərtləri və məxfilik sənədlərində
          göstərilən kanallardan istifadə edin, və ya birbaşa dəstək üçün e-poçt ünvanınızı
          təqdim edən satıcı ilə vitrin üzərindən əlaqə saxlayın.
        </p>

        <div className="mt-6 rounded-2xl border border-[#d9e8d4] bg-[#f4faf4] p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-800/80">
            WhatsApp dəstəyi
          </p>
          <p className="mt-2 font-mono text-lg font-semibold tracking-wide text-stone-900">
            {SUPPORT_WHATSAPP_DISPLAY}
          </p>
          <p className="mt-1 text-xs text-stone-600">
            Platforma, hesab və ümumi suallar üçün birbaşa yazın.
          </p>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1fb855] sm:w-auto"
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.117 1.03 6.98 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp-da yaz
          </a>
        </div>

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
