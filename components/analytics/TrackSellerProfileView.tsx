"use client";

import { useEffect, useRef } from "react";

export default function TrackSellerProfileView({ sellerSlug }: { sellerSlug: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (!sellerSlug || sent.current) return;
    sent.current = true;
    void fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "seller_profile_view", sellerSlug }),
      keepalive: true,
    }).catch(() => {});
  }, [sellerSlug]);

  return null;
}
