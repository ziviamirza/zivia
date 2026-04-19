import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Zivia — Premium zərgərlik bazarı",
    short_name: "Zivia",
    description:
      "TikTok və Instagram zərgərlik satıcılarını bir araya gətirən marketplace. Məhsullar və WhatsApp ilə əlaqə.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f8f2e8",
    theme_color: "#7a5b24",
    lang: "az",
    categories: ["shopping", "lifestyle"],
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
