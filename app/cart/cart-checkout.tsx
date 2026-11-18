"use client";

import { FormEvent, useEffect, useState } from "react";
import { analyticsContext, track } from "../analytics";
import { useOffer } from "../offer-provider";

type RazorpayInstance = { open(): void; on(name: string, callback: (response: { error?: { description?: string; metadata?: { order_id?: string; payment_id?: string } } }) => void): void };
declare global { interface Window { Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance } }

let checkoutScriptPromise: Promise<void> | null = null;
function loadCheckout() {
  if (window.Razorpay) return Promise.resolve();
  if (checkoutScriptPromise) return checkoutScriptPromise;
  checkoutScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => { checkoutScriptPromise = null; script.remove(); reject(new Error("Could not load secure checkout")); };
    document.head.appendChild(script);
  });
  return checkoutScriptPromise;
}

export default function CartCheckout({ placement, source }: { placement?: string; source?: "job_fit_offer" }) {
  const { offer, refresh } = useOffer();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quotedPrice, setQuotedPrice] = useState<number | null>(null);
  const checkoutPrice = quotedPrice ?? offer.currentPrice;
  const savings = Math.max(0, offer.regularPrice - checkoutPrice);

  useEffect(() => { track("checkout_opened", { placement: placement || "cart", value: offer.currentPrice }); }, [placement, offer.currentPrice]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError("");
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "");
    const email = String(data.get("email") || "");
    const context = analyticsContext();
    try {
      const response = await fetch("/api/razorpay/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, ...context }) });
      const order = await response.json();
      if (!response.ok) throw new Error(order.error || "Checkout is unavailable");
      setQuotedPrice(order.amount / 100);
      void refresh();
      track("checkout_details_submitted", { value: order.amount / 100, placement: placement || "cart", price_tier: order.priceTier });
      await loadCheckout();
      const checkout = new window.Razorpay!({
        key: order.keyId, amount: order.amount, currency: order.currency, name: "Career Pilot", description: "AI Job Search Bundle", order_id: order.orderId, prefill: { name, email }, theme: { color: "#365846" },
        handler: async (payment: Record<string, string>) => {
          setLoading(true);
          const verified = await fetch("/api/razorpay/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payment, sessionId: context.sessionId }) });
          const result = await verified.json();
          if (!verified.ok) { setError(result.error || "Payment confirmation is pending. Contact support with your payment ID."); setLoading(false); return; }
          if (source === "job_fit_offer") track("lead_to_purchase", { paymentId: payment.razorpay_payment_id, value: order.amount / 100, price_tier: order.priceTier });
          window.location.assign(result.thankYouUrl);
        },
        modal: { ondismiss: () => { track("checkout_dismissed", { orderId: order.orderId }); setLoading(false); } },
      });
      checkout.on("payment.failed", response => { track("payment_failed", { orderId: response.error?.metadata?.order_id || order.orderId, reason: response.error?.description || "unknown" }); setError(response.error?.description || "The payment failed. Please try another payment method."); setLoading(false); });
      track("razorpay_opened", { orderId: order.orderId, value: order.amount / 100, price_tier: order.priceTier });
      checkout.open();
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong"); setLoading(false); }
  }

  return <form className="cart-checkout-form" onSubmit={submit}><div className="cart-price"><span><del>₹{offer.regularPrice}</del> CareerPilot AI Job Search Bundle <em>You save ₹{savings}</em></span><strong>₹{checkoutPrice}</strong></div><label>Your full name<input name="name" autoComplete="name" required minLength={2} maxLength={120} /></label><label>Where should we send your resources?<input name="email" type="email" autoComplete="email" required maxLength={160} /></label><p className="cart-email-note">Please double-check your email address before continuing. Your delivery links will be sent there after payment verification.</p><button className="buy-button" disabled={loading}>{loading ? "Opening secure payment…" : "Proceed to secure payment →"}</button>{error ? <p className="form-error" role="alert">{error}</p> : null}<small>By continuing, you agree to our <a href="/terms">terms</a> and <a href="/digital-delivery">digital delivery policy</a>.</small></form>;
}
