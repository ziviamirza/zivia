import type { Metadata } from "next";
import { Suspense } from "react";
import { Noto_Serif, Outfit } from "next/font/google";
import { Footer } from "@/components/Footer";
import Navbar from "@/components/Navbar";
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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
      <body className="flex min-h-full flex-col font-sans text-stone-900 antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Suspense
          fallback={
            <footer className="border-t border-stone-100 py-10 text-center text-sm text-stone-400">
              …
            </footer>
          }
        >
          <Footer />
        </Suspense>
      </body>
    </html>
  );
}
