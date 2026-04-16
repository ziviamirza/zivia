"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  urls: string[];
  alt: string;
};

function isHttpUrl(s: string) {
  const t = s.trim();
  return t.startsWith("https://") || t.startsWith("http://");
}

export default function ProductImageGallery({ urls, alt }: Props) {
  const valid = urls.filter(isHttpUrl);
  const [idx, setIdx] = useState(0);

  const safeIdx = valid.length ? Math.min(idx, valid.length - 1) : 0;
  const main = valid[safeIdx] ?? "";

  if (!main) {
    return (
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-[#deceb2] bg-gradient-to-br from-stone-100 via-[var(--zivia-warm-white)] to-stone-200/80" />
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden rounded-2xl border border-[#deceb2] bg-stone-50">
        <div className="relative aspect-[4/5]">
          <Image
            key={main}
            src={main}
            alt={alt}
            fill
            priority
            quality={85}
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>
      {valid.length > 1 ? (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {valid.map((u, i) => (
            <button
              key={`${u}-${i}`}
              type="button"
              onClick={() => setIdx(i)}
              className={`relative h-16 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === safeIdx
                  ? "border-[#b08a42] ring-1 ring-[#eadcc4]"
                  : "border-[#deceb2] opacity-80 hover:opacity-100"
              }`}
            >
              <Image src={u} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
