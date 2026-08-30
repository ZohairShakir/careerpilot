import crypto from "node:crypto";

const API = "https://api.razorpay.com/v1";

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

export async function createOrder(name: string, email: string) {
  const response = await fetch(`${API}/orders`, {
    method: "POST",
    headers: { Authorization: authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: 49900,
      currency: "INR",
      receipt: `cp_${crypto.randomUUID().replaceAll("-", "").slice(0, 24)}`,
      notes: { name: name.slice(0, 120), email: email.slice(0, 160), product: "career-pilot-bundle" },
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not create Razorpay order");
  return response.json() as Promise<{ id: string; amount: number; currency: string }>;
}

export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const { keySecret } = credentials();
  const expected = crypto.createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function paymentIsCaptured(paymentId: string) {
  const response = await fetch(`${API}/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: authHeader() },
    cache: "no-store",
  });
  if (!response.ok) return false;
  const payment = (await response.json()) as { status?: string; amount?: number; currency?: string };
  return payment.status === "captured" && payment.amount === 49900 && payment.currency === "INR";
}

export function verifyWebhook(rawBody: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
