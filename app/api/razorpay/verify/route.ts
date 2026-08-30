import { NextResponse } from "next/server";
import { createDownloadToken, products } from "../../../../lib/downloads";
import { paymentIsCaptured, verifyPaymentSignature } from "../../../../lib/razorpay";
import { bestEffort, supabaseRequest } from "../../../../lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderId = body.razorpay_order_id;
    const paymentId = body.razorpay_payment_id;
    const signature = body.razorpay_signature;
    if (![orderId, paymentId, signature].every(value => typeof value === "string")) return NextResponse.json({ error: "Invalid payment response." }, { status: 400 });
    if (!verifyPaymentSignature(orderId, paymentId, signature)) return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
    if (!(await paymentIsCaptured(paymentId))) return NextResponse.json({ error: "Your payment is verified but still being captured. Please try again shortly." }, { status: 409 });
    await bestEffort(async () => {
      const attempts = await supabaseRequest<Array<{ id: string; email: string; session_id: string | null }>>(`checkout_attempts?razorpay_order_id=eq.${encodeURIComponent(orderId)}&select=id,email,session_id&limit=1`);
      const attempt = attempts?.[0];
      await Promise.all([
        supabaseRequest(`checkout_attempts?razorpay_order_id=eq.${encodeURIComponent(orderId)}`, { method: "PATCH", body: JSON.stringify({ status: "captured", updated_at: new Date().toISOString() }) }),
        supabaseRequest("purchases?on_conflict=razorpay_payment_id", { method: "POST", body: JSON.stringify({ checkout_attempt_id: attempt?.id || null, session_id: attempt?.session_id || null, razorpay_order_id: orderId, razorpay_payment_id: paymentId, email: attempt?.email || null, amount: 49900, currency: "INR", status: "captured" }) }, "resolution=merge-duplicates"),
      ]);
    });
    const expiresAt = Date.now() + 15 * 60 * 1000;
    const labels = { blueprint: "AI Job Search Blueprint", resume: "AI-Ready Resume Template", checklist: "Job Search Checklist" };
    const downloads = Object.keys(products).map(key => ({ label: labels[key as keyof typeof labels], url: `/api/download?token=${encodeURIComponent(createDownloadToken(paymentId, key as keyof typeof products, expiresAt))}` }));
    return NextResponse.json({ downloads });
  } catch (error) {
    console.error("Payment verification failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "We could not confirm the payment." }, { status: 500 });
  }
}
