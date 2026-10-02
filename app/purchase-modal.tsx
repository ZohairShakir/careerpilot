"use client";

import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { analyticsContext, track } from "./analytics";
import type { PurchaseButtonProps } from "./purchase-button";

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

export default function PurchaseModal({ offerToken, offerPrice, source, prefillName, prefillEmail, onClose }: PurchaseButtonProps & { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "applied" | "invalid">("idle");

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && closeModal();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  function closeModal() {
    track("checkout_dismissed");
    onClose();
  }

  function applyPromoCode() {
    const applied = promoCode.trim().toUpperCase() === "FB299";
    setPromoStatus(applied ? "applied" : "invalid");
    if (applied) track("discount_clicked", { offer: "FB299", value: 299 });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError("");
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "");
    const email = String(data.get("email") || "");
    const context = analyticsContext();
    const appliedPromoCode = promoStatus === "applied" ? "FB299" : undefined;
    const expectedPrice = appliedPromoCode ? 299 : offerPrice || 499;
    try {
      track("checkout_details_submitted", { value: expectedPrice, placement: source || "standard", ...(appliedPromoCode ? { promoCode: appliedPromoCode } : {}) });
      const response = await fetch("/api/razorpay/order", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, offerToken, promoCode: appliedPromoCode, ...context }),
      });
      const order = await response.json();
      if (!response.ok) throw new Error(order.error || "Checkout is unavailable");
      if (order.amount !== expectedPrice * 100) throw new Error("This price could not be verified. Please refresh and try again.");
      await loadCheckout();
      const checkout = new window.Razorpay!({
        key: order.keyId, amount: order.amount, currency: order.currency, name: "Career Pilot",
        description: "AI Job Search Bundle", order_id: order.orderId, prefill: { name, email },
        theme: { color: "#365846" },
        handler: async (payment: Record<string, string>) => {
          setLoading(true);
          const verified = await fetch("/api/razorpay/verify", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payment, sessionId: context.sessionId }),
          });
          const result = await verified.json();
          if (!verified.ok) { setError(result.error || "Payment confirmation is pending. Contact support with your payment ID."); setLoading(false); return; }
          if (source === "job_fit_offer") track("lead_to_purchase", { paymentId: payment.razorpay_payment_id, value: order.amount / 100 });
          window.location.assign(result.thankYouUrl);
        },
        modal: { ondismiss: () => { track("checkout_dismissed", { orderId: order.orderId }); setLoading(false); } },
      });
      checkout.on("payment.failed", response => {
        track("payment_failed", { orderId: response.error?.metadata?.order_id || order.orderId, reason: response.error?.description || "unknown" });
        setError(response.error?.description || "The payment failed. Please try another payment method.");
      });
      track("razorpay_opened", { orderId: order.orderId, value: order.amount / 100 });
      checkout.open();
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong"); setLoading(false); }
  }

  return createPortal(<div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeModal()}><section className="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title"><button className="close" aria-label="Close checkout" onClick={closeModal}>×</button>
      {<><h2 id="checkout-title">Start moving with clarity.</h2><p className="modal-intro">Enter your details to continue to secure Razorpay checkout.</p><div className="modal-order"><span>Career Pilot AI Job Search Bundle</span><b>{promoStatus === "applied" ? "₹299" : offerPrice ? `₹${offerPrice}` : "₹499"}</b></div>{promoStatus === "applied" ? <p className="modal-offer-note">FB299 applied · You save ₹200</p> : offerPrice ? <p className="modal-offer-note">Job Fit Check offer · 20% off the regular ₹499 price</p> : null}<form onSubmit={submit}><label>Full name<input name="name" autoComplete="name" required minLength={2} defaultValue={prefillName} /></label><label>Email address<input name="email" type="email" autoComplete="email" required defaultValue={prefillEmail} /></label><div className="promo-code"><label htmlFor="promo-code">Promo code</label><div><input id="promo-code" name="promoCode" value={promoCode} onChange={event => { setPromoCode(event.target.value.toUpperCase()); setPromoStatus("idle"); }} placeholder="Enter code" autoComplete="off" /><button type="button" onClick={applyPromoCode}>Apply</button></div>{promoStatus === "applied" ? <p className="promo-success">Code applied. Your total is ₹299.</p> : promoStatus === "invalid" ? <p className="promo-error">This promo code isn’t valid.</p> : null}</div><button className="buy-button" disabled={loading}>{loading ? "Please wait…" : "Continue to secure payment"}</button>{error ? <p className="form-error">{error}</p> : null}<small>By continuing, you agree to our terms and digital delivery policy.</small></form></>}
    </section></div>, document.body);
}
