"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { analyticsContext, track } from "./analytics";

type RazorpayInstance = { open(): void; on(name: string, callback: (response: { error?: { description?: string; metadata?: { order_id?: string; payment_id?: string } } }) => void): void };
declare global { interface Window { Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance } }

type Props = { compact?: boolean; light?: boolean };
type Downloads = { label: string; url: string }[];

let checkoutScriptPromise: Promise<void> | null = null;
function loadCheckout() {
  if (window.Razorpay) return Promise.resolve();
  if (checkoutScriptPromise) return checkoutScriptPromise;
  checkoutScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load secure checkout"));
    document.head.appendChild(script);
  });
  return checkoutScriptPromise;
}

export default function PurchaseButton({ compact, light }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloads, setDownloads] = useState<Downloads>([]);
  const [bundleUrl, setBundleUrl] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open]);

  function openModal() {
    track("bundle_cta_clicked", { placement: compact ? "header" : light ? "purchase_section" : "hero" });
    track("checkout_opened");
    setOpen(true);
  }

  function closeModal() {
    if (!bundleUrl) track("checkout_dismissed");
    setOpen(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError("");
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "");
    const email = String(data.get("email") || "");
    const context = analyticsContext();
    try {
      track("checkout_details_submitted");
      const response = await fetch("/api/razorpay/order", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, ...context }),
      });
      const order = await response.json();
      if (!response.ok) throw new Error(order.error || "Checkout is unavailable");
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
          track("payment_captured", { paymentId: payment.razorpay_payment_id, orderId: payment.razorpay_order_id, value: 499 });
          setDownloads(result.downloads); setBundleUrl(result.bundleUrl); setLoading(false);
        },
        modal: { ondismiss: () => { track("checkout_dismissed", { orderId: order.orderId }); setLoading(false); } },
      });
      checkout.on("payment.failed", response => {
        track("payment_failed", { orderId: response.error?.metadata?.order_id || order.orderId, reason: response.error?.description || "unknown" });
        setError(response.error?.description || "The payment failed. Please try another payment method.");
      });
      track("razorpay_opened", { orderId: order.orderId });
      checkout.open();
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong"); setLoading(false); }
  }

  return <>
    <button className={`buy-button ${compact ? "compact" : ""} ${light ? "light" : ""}`} onClick={openModal}>{compact ? "Get the bundle" : "Get the complete bundle — ₹499"}</button>
    {open ? <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeModal()}><section className="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title"><button className="close" aria-label="Close checkout" onClick={closeModal}>×</button>
      {bundleUrl ? <div className="success">
        <div className="success-visual"><Image src="/assets/career-pilot-bundle-white.png" alt="Career Pilot bundle with the AI Job Search Blueprint, resume template and checklist" width={560} height={420} priority /></div>
        <div className="success-heading"><span className="success-mark" aria-hidden="true">✓</span><span>Payment successful</span></div>
        <h2 id="checkout-title">Your bundle is ready.</h2>
        <p>Everything you need to plan, apply, and move forward with more clarity.</p>
        <a className="bundle-download" href={bundleUrl} onClick={() => track("bundle_downloaded", { file: "complete_bundle" })}><span>Download complete bundle</span><span aria-hidden="true">↓</span></a>
        <small>3 resources · ZIP file · Secure download</small>
        <details className="individual-downloads" onToggle={(event) => event.currentTarget.open && track("bundle_downloaded", { file: "individual_downloads_opened" })}>
          <summary>Prefer individual files?<span aria-hidden="true">+</span></summary>
          <div>{downloads.map(item => <a key={item.url} href={item.url} onClick={() => track("bundle_downloaded", { file: item.label })}>{item.label}<span aria-hidden="true">↓</span></a>)}</div>
        </details>
        <p className="expiry-note">Download links expire in 15 minutes.</p>
      </div> : <><h2 id="checkout-title">Start moving with clarity.</h2><p className="modal-intro">Enter your details to continue to secure Razorpay checkout.</p><div className="modal-order"><span>Career Pilot AI Job Search Bundle</span><b>₹499</b></div><form onSubmit={submit}><label>Full name<input name="name" autoComplete="name" required minLength={2} /></label><label>Email address<input name="email" type="email" autoComplete="email" required /></label><button className="buy-button" disabled={loading}>{loading ? "Please wait…" : "Continue to secure payment"}</button>{error ? <p className="form-error">{error}</p> : null}<small>By continuing, you agree to our terms and digital delivery policy.</small></form></>}
    </section></div> : null}
  </>;
}
