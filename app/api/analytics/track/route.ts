import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  allowAnalyticsEvent,
  clientKeyFromRequest,
} from "@/lib/analytics-rate-limit";

type Body = {
  event?: string;
  productSlug?: string;
  sellerSlug?: string;
};

function createAnonServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(req: Request) {
  const key = clientKeyFromRequest(req);
  if (!allowAnalyticsEvent(key)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const event = body.event;
  if (
    event !== "product_view" &&
    event !== "whatsapp_click" &&
    event !== "seller_profile_view"
  ) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const supabase = createAnonServerClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "supabase_env" }, { status: 500 });
  }

  const { error } = await supabase.rpc("track_analytics_event", {
    p_event: event,
    p_product_slug: body.productSlug?.trim() ?? null,
    p_seller_slug: body.sellerSlug?.trim() ?? null,
  });

  if (error) {
    return NextResponse.json(
      { ok: false, code: error.code ?? "rpc_error" },
      { status: 422 },
    );
  }

  return NextResponse.json({ ok: true });
}
