import { NextResponse } from "next/server";
import { createOrder } from "../../../../lib/razorpay";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function POST(request: Request) {
  try {
    // Browser price, promo codes, and old discount tokens never determine the amount.
    const { name, email, sessionId, attribution = {} } = await request.json();
    if (typeof name !== "string" || name.trim().length < 2 || name.length > 120 || typeof email !== "string" || email.length > 160 || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Enter a valid name and email." }, { status:400 });
    const validSessionId = typeof sessionId === "string" && UUID.test(sessionId) ? sessionId : null;
    const safeAttribution = Object.fromEntries(["source","medium","campaign","content","term","referrer"].map(key => [key,String(attribution?.[key] || "").slice(0,160)]));
    const order = await createOrder(name.trim(),email.trim().toLowerCase(),validSessionId,safeAttribution);
    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency, priceTier: order.priceTier, expiresAt: order.expiresAt, keyId: process.env.RAZORPAY_KEY_ID }, { headers: { "Cache-Control":"no-store" } });
  } catch (error) {
    console.error("Order creation failed",error instanceof Error ? error.message : error);
    return NextResponse.json({ error:"Secure checkout is temporarily unavailable. Please try again shortly or contact arkzlab@gmail.com." }, { status:503 });
  }
}
