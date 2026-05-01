import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Qeydiyyat",
  description: "Zivia-da satıcı hesabı yaradın.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
