import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ayarlar",
  description:
    "Hesab, məxfilik, dəstək və satıcı alətləri — Zivia marketplace ayarları.",
};

export default function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
