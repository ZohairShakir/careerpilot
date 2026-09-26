import crypto from "node:crypto";
import { hasValidJobFitOffer } from "./job-fit-offer";

const API = "https://api.razorpay.com/v1";
export const STANDARD_PRICE = 49900;
export const JOB_FIT_PRICE = 39900;
export const FB299_PRICE = 29900;
export const FB299_CODE = "FB299";

export function validPromoCode(value: unknown) {
  return typeof value === "string" && value.trim().toUpperCase() === FB299_CODE;
}

function credentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay is not configured");
  return { keyId, keySecret };
}

function authHeader() {
  const { keyId, keySecret } = credentials();
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

export async function createOrder(name: string, email: string, offerToken?: unknown, promoCode?: unknown) {
  const jobFitOffer = hasValidJobFitOffer(offerToken);
  const promoApplied = validPromoCode(promoCode);
  const amount = promoApplied ? FB299_PRICE : jobFitOffer ? JOB_FIT_PRICE : STANDARD_PRICE;
  const offer = promoApplied ? FB299_CODE : jobFitOffer ? "JOBFIT20" : null;
  const response = await fetch(`${API}/orders`, {
    method: "POST",
    headers: { Authorization: authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify({
      amount,
      currency: "INR",
      receipt: `cp_${crypto.randomUUID().replaceAll("-", "").slice(0, 24)}`,
      notes: { name: name.slice(0, 120), email: email.slice(0, 160), product: "career-pilot-bundle", offer: offer || "standard" },
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not create Razorpay order");
  const order = await response.json() as { id: string; amount: number; currency: string };
  return { ...order, offer };
}

export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const { keySecret } = credentials();
  const expected = crypto.createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function capturedPayment(paymentId: string) {
  const response = await fetch(`${API}/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: authHeader() },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const payment = (await response.json()) as { status?: string; amount?: number; currency?: string };
  if (payment.status !== "captured" || payment.currency !== "INR" || ![STANDARD_PRICE, JOB_FIT_PRICE, FB299_PRICE].includes(payment.amount || 0)) return null;
  return { amount: payment.amount!, currency: payment.currency };
}

export function verifyWebhook(rawBody: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
