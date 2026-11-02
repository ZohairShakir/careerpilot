import { createDownloadToken } from "./downloads";
import { offerRpc } from "./launch-offer";
import type { PriceTier } from "./offer-config";

const DELIVERY_LINK_MS = 7 * 24 * 60 * 60 * 1000;
const RESEND_API = "https://api.resend.com/emails";

type VerifiedPurchase = {
  paymentId: string;
  orderId: string;
  amount: number;
  priceTier: PriceTier;
  name: string | null;
  email: string | null;
  requestUrl: string;
};

type DeliveryClaim = {
  claimed: boolean;
  status: "sending" | "sent" | "failed";
  recipientEmail: string;
  linkExpiresAt: string;
};

export type DeliveryResult = { status: "sent" | "processing"; messageId?: string };

function emailConfiguration() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  const replyTo = process.env.RESEND_REPLY_TO?.trim();
  if (!apiKey || !from) throw new Error("Purchase email delivery is not configured");
  return { apiKey, from, replyTo };
}

function publicOrigin(requestUrl: string) {
  const configured = process.env.SITE_URL?.trim();
  if (configured) return new URL(configured).origin;
  const requestOrigin = new URL(requestUrl).origin;
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/u.test(requestOrigin)
    ? requestOrigin
    : "https://careerpilot.store";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/gu, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] || character);
}

async function markFailed(paymentId: string, error: string) {
  try {
    await offerRpc("fail_purchase_delivery", { p_payment_id: paymentId, p_error: error.slice(0, 500) });
  } catch (persistenceError) {
    console.error("Could not record failed purchase delivery", persistenceError instanceof Error ? persistenceError.message : persistenceError);
  }
}

export async function deliverVerifiedPurchase(purchase: VerifiedPurchase): Promise<DeliveryResult> {
  if (!purchase.email || !/^\S+@\S+\.\S+$/u.test(purchase.email)) throw new Error("Verified purchase has no deliverable email address");
  const config = emailConfiguration();
  const initialExpiry = new Date(Date.now() + DELIVERY_LINK_MS).toISOString();
  const claim = await offerRpc<DeliveryClaim>("claim_purchase_delivery", {
    p_payment_id: purchase.paymentId,
    p_order_id: purchase.orderId,
    p_email: purchase.email,
    p_link_expires_at: initialExpiry,
  });
  if (!claim.claimed) return { status: claim.status === "sent" ? "sent" : "processing" };

  const expiresAt = new Date(claim.linkExpiresAt).getTime();
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    await markFailed(purchase.paymentId, "Secure download link expired before email delivery");
    throw new Error("Secure download link expired before email delivery");
  }

  const amount = purchase.amount / 100;
  const firstName = (purchase.name || "there").trim().split(/\s+/u)[0] || "there";
  const bundleUrl = `${publicOrigin(purchase.requestUrl)}/api/download?token=${encodeURIComponent(createDownloadToken(purchase.paymentId, "bundle", expiresAt))}`;
  const safeName = escapeHtml(firstName);
  const safeUrl = escapeHtml(bundleUrl);
  const subject = "Your CareerPilot bundle is ready";
  const text = `Hi ${firstName},\n\nYour verified payment of ₹${amount} was successful.\n\nDownload your CareerPilot bundle: ${bundleUrl}\n\nThis secure link expires in 7 days. Your purchase includes a 7-day refund policy.\n\nNeed help? Reply to this email or contact arkzlab@gmail.com.`;
  const html = `<div style="max-width:600px;margin:0 auto;padding:36px 24px;color:#171916;font-family:Arial,sans-serif;line-height:1.6"><p style="color:#365846;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">CareerPilot</p><h1 style="margin:18px 0;color:#17382b;font-family:Georgia,serif;font-size:40px;line-height:1.05;font-weight:400">Your bundle is ready.</h1><p>Hi ${safeName}, your verified payment of <strong>₹${amount}</strong> was successful.</p><p><a href="${safeUrl}" style="display:block;margin:28px 0;padding:16px 20px;background:#365846;color:#fff;text-align:center;text-decoration:none;font-weight:700">Download your CareerPilot bundle</a></p><p style="font-size:13px;color:#676a64">This secure download link expires in 7 days. Your purchase includes a 7-day refund policy.</p><p style="font-size:13px;color:#676a64">Need help? Reply to this email or contact <a href="mailto:arkzlab@gmail.com">arkzlab@gmail.com</a>.</p></div>`;

  try {
    const response = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `careerpilot-delivery/${purchase.paymentId}`,
      },
      body: JSON.stringify({
        from: config.from,
        to: [claim.recipientEmail],
        subject,
        html,
        text,
        ...(config.replyTo ? { reply_to: config.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(3_000),
    });
    const result = await response.json().catch(() => ({})) as { id?: string; message?: string; error?: { message?: string } };
    if (!response.ok || !result.id) throw new Error(result.message || result.error?.message || `Resend rejected delivery (${response.status})`);
    await offerRpc("complete_purchase_delivery", { p_payment_id: purchase.paymentId, p_provider_message_id: result.id });
    return { status: "sent", messageId: result.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email delivery error";
    await markFailed(purchase.paymentId, message);
    throw error;
  }
}
