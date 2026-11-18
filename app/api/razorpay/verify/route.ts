import { NextResponse } from "next/server";
import { offerRpc } from "../../../../lib/launch-offer";
import { deliverVerifiedPurchase } from "../../../../lib/purchase-delivery";
import { capturedPayment, verifyPaymentSignature } from "../../../../lib/razorpay";
import { createPurchaseReceipt, RECEIPT_COOKIE } from "../../../../lib/purchase-receipt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderId = body.razorpay_order_id;
    const paymentId = body.razorpay_payment_id;
    const signature = body.razorpay_signature;
    if (![orderId, paymentId, signature].every(value => typeof value === "string")) return NextResponse.json({ error: "Invalid payment response." }, { status: 400 });
    if (!verifyPaymentSignature(orderId, paymentId, signature)) return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
    const payment = await capturedPayment(paymentId, orderId);
    if (!payment) return NextResponse.json({ error: "Your payment is verified but still being captured. Please try again shortly." }, { status: 409 });
    await offerRpc("record_launch_capture", {
      p_reservation_id: payment.reservationId,
      p_order_id: payment.orderId,
      p_payment_id: paymentId,
      p_amount: payment.amount,
      p_email: payment.email,
      p_event_id: `client:${paymentId}`,
      p_event_type: "client.payment.verified",
      p_payload: { source: "verified_checkout_callback", orderId, paymentId },
    });
    let emailDelivery: "sent" | "processing" | "pending" = "pending";
    try {
      const delivery = await deliverVerifiedPurchase({ paymentId, orderId, amount: payment.amount, priceTier: payment.priceTier, name: payment.name, email: payment.email, requestUrl: request.url });
      emailDelivery = delivery.status;
    } catch (error) {
      console.error("Verified purchase email is pending", error instanceof Error ? error.message : error);
    }
    const expiresAt = Date.now() + 15 * 60 * 1000;
    const response = NextResponse.json({ emailDelivery, thankYouUrl: "/thank-you" });
    response.cookies.set(RECEIPT_COOKIE, createPurchaseReceipt({ paymentId, orderId, amount: payment.amount, priceTier: payment.priceTier, deliveryStatus: emailDelivery === "sent" ? "sent" : "processing", expiresAt }), {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/thank-you", maxAge: 15 * 60,
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("Payment verification failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "We could not confirm the payment." }, { status: 500 });
  }
}
