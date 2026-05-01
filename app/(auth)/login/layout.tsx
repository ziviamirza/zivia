import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giriş",
  description: "Zivia satıcı panelinə giriş.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
