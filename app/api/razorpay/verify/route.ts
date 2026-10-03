import { NextResponse } from "next/server";
import { createDownloadToken } from "../../../../lib/downloads";
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
    const expiresAt = Date.now() + 15 * 60 * 1000;
    const labels = { blueprint: "AI Job Search Blueprint", quickStart: "Quick Start Guide", implementationPlan: "30-Day Implementation Plan", resume: "AI-Ready Resume Template", checklist: "AI Job Search Checklist", tracker: "Job Application Tracker" };
    const productIds = Object.keys(labels) as Array<keyof typeof labels>;
    const downloads = productIds.map(key => ({ label: labels[key], url: `/api/download?token=${encodeURIComponent(createDownloadToken(paymentId, key, expiresAt))}` }));
    const bundleUrl = `/api/download?token=${encodeURIComponent(createDownloadToken(paymentId, "bundle", expiresAt))}`;
    const response = NextResponse.json({ bundleUrl, downloads, thankYouUrl: "/thank-you" });
    response.cookies.set(RECEIPT_COOKIE, createPurchaseReceipt({ paymentId, orderId, amount: payment.amount, priceTier: payment.priceTier, expiresAt }), {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/thank-you", maxAge: 15 * 60,
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("Payment verification failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "We could not confirm the payment." }, { status: 500 });
  }
}
