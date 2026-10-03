import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { capturedPayment, verifyWebhook } from "../../../../lib/razorpay";
import { offerRpc } from "../../../../lib/launch-offer";
import { supabaseRequest } from "../../../../lib/supabase";
export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!verifyWebhook(rawBody,request.headers.get("x-razorpay-signature") || "")) return NextResponse.json({ error:"Invalid signature" }, { status:400 });
  try {
    const webhook = JSON.parse(rawBody);
    const entity = webhook.payload?.payment?.entity;
    if (["payment.captured","order.paid"].includes(webhook.event)) {
      if (!entity?.id || !entity.order_id) return NextResponse.json({ error:"Missing payment details" }, { status:400 });
      const payment = await capturedPayment(entity.id,entity.order_id);
      if (!payment) return NextResponse.json({ error:"Payment capture is not confirmed" }, { status:409 });
      // Commit before acknowledging. DB failures return 503 for gateway retries.
      await offerRpc("record_launch_capture", { p_reservation_id:payment.reservationId,p_order_id:payment.orderId,p_payment_id:entity.id,p_amount:payment.amount,p_email:payment.email,
        p_event_id:request.headers.get("x-razorpay-event-id") || webhook.id || crypto.createHash("sha256").update(rawBody).digest("hex"),p_event_type:webhook.event,p_payload:webhook });
    } else if (webhook.event === "payment.failed" && entity?.order_id) {
      await supabaseRequest(`checkout_attempts?razorpay_order_id=eq.${encodeURIComponent(entity.order_id)}&status=neq.captured`, { method:"PATCH",body:JSON.stringify({ status:"failed",updated_at:new Date().toISOString() }) });
    }
    return new NextResponse(null,{ status:200 });
  } catch (error) {
    console.error("Webhook processing failed",error instanceof Error ? error.message : error);
    return NextResponse.json({ error:"Payment persistence is pending; retry required" },{ status:503 });
  }
}
