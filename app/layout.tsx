import type { Metadata } from "next";
import { Noto_Serif, Outfit } from "next/font/google";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { buildSiteJsonLd } from "@/lib/jsonld";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const notoSerif = Noto_Serif({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = getSiteUrl();
const siteJsonLd = buildSiteJsonLd(siteUrl);

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/icon", type: "image/png", sizes: "96x96" },
    ],
    apple: [{ url: "/apple-icon", type: "image/png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
  title: {
    default: "Zivia — Premium zərgərlik bazarı",
    template: "%s | Zivia",
  },
  description:
    "TikTok və Instagram zərgərlik satıcılarını bir araya gətirən premium marketplace. Məhsullar, satıcı profilləri və WhatsApp ilə birbaşa əlaqə.",
  applicationName: "Zivia",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "az_AZ",
    siteName: "Zivia",
    url: siteUrl,
    title: "Zivia — Premium zərgərlik bazarı",
    description:
      "TikTok və Instagram zərgərlik satıcılarını bir araya gətirən premium marketplace.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zivia — Premium zərgərlik bazarı",
    description:
      "TikTok və Instagram zərgərlik satıcılarını bir araya gətirən premium marketplace.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="az"
      data-scroll-behavior="smooth"
      className={`${outfit.variable} ${notoSerif.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full bg-[var(--background)] font-sans text-stone-900 antialiased">
        <JsonLd id="zivia-site-jsonld" data={siteJsonLd} />
        <div className="app-shell">
          <Navbar />
          <main className="flex-1 pb-5">{children}</main>
          <footer className="border-t border-[#e5d7c0] bg-[#f8f2e8] px-4 py-3">
            <div className="flex items-center justify-between text-[11px] text-stone-600">
              <p>© {new Date().getFullYear()} Zivia</p>
              <div className="flex items-center gap-3">
                <Link href="/privacy" className="hover:text-[#8b6b2c]">
                  Məxfilik
                </Link>
                <Link href="/terms" className="hover:text-[#8b6b2c]">
                  Şərtlər
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
