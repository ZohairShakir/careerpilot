import crypto from "node:crypto";
import { after, NextResponse } from "next/server";
import { verifyWebhook } from "../../../../lib/razorpay";
import { bestEffort, supabaseRequest } from "../../../../lib/supabase";

type Webhook = {
  id?: string;
  event?: string;
  payload?: { payment?: { entity?: { id?: string; order_id?: string; email?: string; amount?: number; currency?: string } } };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";
  if (!verifyWebhook(rawBody, signature)) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  const webhook = JSON.parse(rawBody) as Webhook;
  after(() => bestEffort(async () => {
    const eventId = webhook.id || crypto.createHash("sha256").update(rawBody).digest("hex");
    await supabaseRequest("webhook_events?on_conflict=event_id", { method: "POST", body: JSON.stringify({ event_id: eventId, event_type: webhook.event || "unknown", payload: webhook }) }, "resolution=ignore-duplicates");
    const payment = webhook.payload?.payment?.entity;
    if (!payment?.order_id) return;
    const status = webhook.event === "payment.failed" ? "failed" : webhook.event === "payment.captured" || webhook.event === "order.paid" ? "captured" : null;
    if (!status) return;
    await supabaseRequest(`checkout_attempts?razorpay_order_id=eq.${encodeURIComponent(payment.order_id)}`, { method: "PATCH", body: JSON.stringify({ status, updated_at: new Date().toISOString() }) });
    if (status === "captured" && payment.id) {
      const attempts = await supabaseRequest<Array<{ id: string; email: string; session_id: string | null }>>(`checkout_attempts?razorpay_order_id=eq.${encodeURIComponent(payment.order_id)}&select=id,email,session_id&limit=1`);
      const attempt = attempts?.[0];
      await supabaseRequest("purchases?on_conflict=razorpay_payment_id", { method: "POST", body: JSON.stringify({ checkout_attempt_id: attempt?.id || null, session_id: attempt?.session_id || null, razorpay_order_id: payment.order_id, razorpay_payment_id: payment.id, email: attempt?.email || payment.email || null, amount: payment.amount || 49900, currency: payment.currency || "INR", status: "captured" }) }, "resolution=merge-duplicates");
    }
  }));
  return new NextResponse(null, { status: 200 });
}
