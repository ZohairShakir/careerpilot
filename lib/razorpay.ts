import crypto from "node:crypto";
import { offerParameters, offerRpc, type Reservation } from "./launch-offer";
import { supabaseRequest } from "./supabase";
import type { PriceTier } from "./offer-config";

const API = "https://api.razorpay.com/v1";
function credentials() {
  const keyId = process.env.RAZORPAY_KEY_ID, keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay is not configured");
  return { keyId, keySecret };
}
function authHeader() {
  const { keyId, keySecret } = credentials();
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}
export async function createOrder(name: string, email: string, sessionId: string | null, attribution: Record<string,string>) {
  const reservation = await offerRpc<Reservation>("reserve_launch_order", { ...offerParameters(), p_name: name, p_email: email, p_session_id: sessionId, p_attribution: attribution });
  let created = false;
  try {
    const response = await fetch(`${API}/orders`, {
      method: "POST", headers: { Authorization: authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({ amount: reservation.amount, currency: "INR", receipt: `cp_${reservation.id.replaceAll("-", "").slice(0,24)}`,
        notes: { name, email, product: "career-pilot-bundle", reservation_id: reservation.id, campaign: reservation.campaign, price_tier: reservation.price_tier,
          utm_source: attribution.source, utm_medium: attribution.medium, utm_campaign: attribution.campaign, utm_content: attribution.content } }), cache: "no-store",
    });
    if (!response.ok) throw new Error("Could not create Razorpay order");
    const order = await response.json() as { id: string; amount: number; currency: string };
    created = true;
    if (order.amount !== reservation.amount || order.currency !== "INR") throw new Error("Unexpected Razorpay order amount");
    await offerRpc("bind_launch_order", { p_reservation_id: reservation.id, p_order_id: order.id });
    return { ...order, priceTier: reservation.price_tier, expiresAt: reservation.expires_at };
  } catch (error) {
    if (!created) await supabaseRequest(`launch_reservations?id=eq.${reservation.id}&captured_payment_id=is.null`, { method: "PATCH", body: JSON.stringify({ released_at: new Date().toISOString() }) }).catch(() => {});
    throw error;
  }
}
function equalSignature(expected: string, signature: string) {
  if (!/^[a-f0-9]{64}$/i.test(signature)) return false;
  const a = Buffer.from(expected,"hex"), b = Buffer.from(signature,"hex");
  return a.length === b.length && crypto.timingSafeEqual(a,b);
}
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  return equalSignature(crypto.createHmac("sha256",credentials().keySecret).update(`${orderId}|${paymentId}`).digest("hex"),signature);
}
export async function capturedPayment(paymentId: string, expectedOrderId?: string) {
  const response = await fetch(`${API}/payments/${encodeURIComponent(paymentId)}`, { headers: { Authorization: authHeader() }, cache: "no-store" });
  if (!response.ok) throw new Error("Could not fetch payment confirmation");
  const payment = await response.json() as { status?: string; amount?: number; currency?: string; order_id?: string; email?: string };
  if (payment.status !== "captured" || payment.currency !== "INR" || !Number.isInteger(payment.amount) || !payment.amount || payment.amount <= 0 || !payment.order_id || (expectedOrderId && payment.order_id !== expectedOrderId)) return null;
  const orderResponse = await fetch(`${API}/orders/${encodeURIComponent(payment.order_id)}`, { headers: { Authorization: authHeader() }, cache: "no-store" });
  if (!orderResponse.ok) throw new Error("Could not verify purchased product");
  const order = await orderResponse.json() as { amount: number; currency: string; notes?: Record<string,string> };
  if (order.amount !== payment.amount || order.currency !== payment.currency || order.notes?.product !== "career-pilot-bundle") return null;
  const tier = order.notes.price_tier;
  return { amount: payment.amount, currency: payment.currency, orderId: payment.order_id, email: payment.email || null,
    priceTier: (tier === "launch_149" || tier === "regular_299" ? tier : "legacy") as PriceTier, reservationId: order.notes.reservation_id || null };
}
export function verifyWebhook(rawBody: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  return Boolean(secret && equalSignature(crypto.createHmac("sha256",secret).update(rawBody).digest("hex"),signature));
}
