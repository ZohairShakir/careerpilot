import crypto from "node:crypto";
import type { PriceTier } from "./offer-config";

export const RECEIPT_COOKIE = "careerpilot_purchase";
type DeliveryStatus = "sent" | "processing";
type Receipt = { paymentId: string; orderId: string; amount: number; priceTier?: PriceTier; deliveryStatus?: DeliveryStatus; expiresAt: number };
function secret() {
  if (!process.env.DOWNLOAD_SIGNING_SECRET) throw new Error("Download signing is not configured");
  return process.env.DOWNLOAD_SIGNING_SECRET;
}
export function createPurchaseReceipt(receipt: Receipt) {
  const payload = Buffer.from(JSON.stringify(receipt)).toString("base64url");
  return `${payload}.${crypto.createHmac("sha256", secret()).update(`purchase:${payload}`).digest("base64url")}`;
}
export function readPurchaseReceipt(token?: string): (Receipt & { deliveryStatus: DeliveryStatus }) | null {
  if (!token) return null;
  try {
    const [payload, signature, extra] = token.split(".");
    if (!payload || !signature || extra) return null;
    const expected = crypto.createHmac("sha256", secret()).update(`purchase:${payload}`).digest();
    const actual = Buffer.from(signature, "base64url");
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;
    const receipt = JSON.parse(Buffer.from(payload, "base64url").toString()) as Receipt;
    if (typeof receipt.paymentId !== "string" || typeof receipt.orderId !== "string" || !Number.isFinite(receipt.amount) || receipt.amount <= 0 || !Number.isFinite(receipt.expiresAt) || receipt.expiresAt <= Date.now()) return null;
    return { ...receipt, deliveryStatus: receipt.deliveryStatus === "sent" ? "sent" : "processing" };
  } catch { return null; }
}
