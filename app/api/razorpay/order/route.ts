import { NextResponse } from "next/server";
import { createOrder } from "../../../../lib/razorpay";
import { bestEffort, supabaseRequest } from "../../../../lib/supabase";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  try {
    const { name, email, sessionId, attribution = {} } = await request.json();
    if (typeof name !== "string" || name.trim().length < 2 || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Enter a valid name and email." }, { status: 400 });
    const order = await createOrder(name.trim(), email.trim().toLowerCase());
    const validSessionId = typeof sessionId === "string" && UUID.test(sessionId) ? sessionId : null;
    await bestEffort(async () => {
      if (validSessionId) await supabaseRequest("visitor_sessions?on_conflict=session_id", { method: "POST", body: JSON.stringify({ session_id: validSessionId, first_referrer: String(attribution.referrer || "").slice(0, 500), utm_source: String(attribution.source || "").slice(0, 120), utm_medium: String(attribution.medium || "").slice(0, 120), utm_campaign: String(attribution.campaign || "").slice(0, 160), last_seen_at: new Date().toISOString() }) }, "resolution=merge-duplicates");
      await supabaseRequest("checkout_attempts", {
        method: "POST",
        body: JSON.stringify({
        session_id: validSessionId,
        name: name.trim().slice(0, 120), email: email.trim().toLowerCase().slice(0, 160),
        razorpay_order_id: order.id, amount: order.amount, currency: order.currency, status: "created",
        utm_source: String(attribution.source || "").slice(0, 120), utm_medium: String(attribution.medium || "").slice(0, 120), utm_campaign: String(attribution.campaign || "").slice(0, 160),
        }),
      });
    });
    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error("Order creation failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Secure checkout is temporarily unavailable. Please try again shortly or contact arkzlab@gmail.com." }, { status: 503 });
  }
}
