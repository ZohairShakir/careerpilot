import { NextResponse } from "next/server";
import { createDownloadToken, products } from "../../../../lib/downloads";
import { capturedPayment, verifyPaymentSignature } from "../../../../lib/razorpay";
import { bestEffort, supabaseRequest } from "../../../../lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderId = body.razorpay_order_id;
    const paymentId = body.razorpay_payment_id;
    const signature = body.razorpay_signature;
    if (![orderId, paymentId, signature].every(value => typeof value === "string")) return NextResponse.json({ error: "Invalid payment response." }, { status: 400 });
    if (!verifyPaymentSignature(orderId, paymentId, signature)) return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
    const payment = await capturedPayment(paymentId);
    if (!payment) return NextResponse.json({ error: "Your payment is verified but still being captured. Please try again shortly." }, { status: 409 });
    let purchaseEmail: string | null = null;
    let purchaseSessionId: string | null = null;
    let checkoutAttemptId: string | null = null;
    await bestEffort(async () => {
      const attempts = await supabaseRequest<Array<{ id: string; email: string; session_id: string | null; amount: number }>>(`checkout_attempts?razorpay_order_id=eq.${encodeURIComponent(orderId)}&select=id,email,session_id,amount&limit=1`);
      const attempt = attempts?.[0];
      if (attempt && attempt.amount !== payment.amount) throw new Error("Payment amount does not match the checkout order.");
      purchaseEmail = attempt?.email || null;
      purchaseSessionId = attempt?.session_id || null;
      checkoutAttemptId = attempt?.id || null;
      await Promise.all([
        supabaseRequest(`checkout_attempts?razorpay_order_id=eq.${encodeURIComponent(orderId)}`, { method: "PATCH", body: JSON.stringify({ status: "captured", updated_at: new Date().toISOString() }) }),
        supabaseRequest("purchases?on_conflict=razorpay_payment_id", { method: "POST", body: JSON.stringify({ checkout_attempt_id: checkoutAttemptId, session_id: purchaseSessionId, razorpay_order_id: orderId, razorpay_payment_id: paymentId, email: purchaseEmail, amount: payment.amount, currency: payment.currency, status: "captured" }) }, "resolution=merge-duplicates"),
      ]);
    });
    const expiresAt = Date.now() + 15 * 60 * 1000;
    const labels = { blueprint: "AI Job Search Blueprint", quickStart: "Quick Start Guide", implementationPlan: "30-Day Implementation Plan", resume: "AI-Ready Resume Template", checklist: "AI Job Search Checklist", tracker: "Job Application Tracker" };
    const productIds = Object.keys(labels) as Array<keyof typeof labels>;
    const downloads = productIds.map(key => ({ label: labels[key], url: `/api/download?token=${encodeURIComponent(createDownloadToken(paymentId, key, expiresAt))}` }));
    const bundleUrl = `/api/download?token=${encodeURIComponent(createDownloadToken(paymentId, "bundle", expiresAt))}`;
    return NextResponse.json({ bundleUrl, downloads });
  } catch (error) {
    console.error("Payment verification failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "We could not confirm the payment." }, { status: 500 });
  }
}
