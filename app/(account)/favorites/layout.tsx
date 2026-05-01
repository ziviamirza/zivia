import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bəyəndiklərim",
  description: "Seçdiyiniz məhsullar — Zivia.",
};

export default function FavoritesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
