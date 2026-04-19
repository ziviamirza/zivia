import type { NextConfig } from "next";

const remotePatterns: Array<{
  protocol: "https";
  hostname: string;
  pathname: string;
}> = [
  {
    protocol: "https",
    hostname: "images.unsplash.com",
    pathname: "/**",
  },
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
  try {
    const host = new URL(supabaseUrl).hostname;
    remotePatterns.push({
      protocol: "https",
      hostname: host,
      pathname: "/storage/v1/object/public/**",
    });
  } catch {
    // ignore invalid URL at build time
  }
}

const nextConfig: NextConfig = {
  async redirects() {
    return [
      /** Köhnə brauzerlər / Google bəzən birbaşa /favicon.ico axtarır */
      { source: "/favicon.ico", destination: "/icon", permanent: false },
    ];
  },
  images: {
    loader: "custom",
    loaderFile: "./lib/imageLoader.ts",
    remotePatterns,
    qualities: [75, 80, 85, 90, 95],
    formats: ["image/webp", "image/avif"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
