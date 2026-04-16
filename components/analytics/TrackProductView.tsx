"use client";

import { useEffect, useRef } from "react";

export default function TrackProductView({ productSlug }: { productSlug: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (!productSlug || sent.current) return;
    sent.current = true;
    void fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "product_view", productSlug }),
      keepalive: true,
    }).catch(() => {});
  }, [productSlug]);

  return null;
}
