"use client";

import { useEffect } from "react";
import { track } from "../analytics";

type Download = { label: string; url: string };

export default function PurchaseSuccess({ paymentId, orderId, value, priceTier, downloads, deliveryStatus }: {
  paymentId: string;
  orderId: string;
  value: number;
  priceTier: string;
  downloads: Download[];
  deliveryStatus: "sent" | "processing";
}) {
  useEffect(() => {
    const key = `careerpilot_purchase_tracked_${orderId}`;
    if (localStorage.getItem(key)) return;
    track("payment_captured", { paymentId, orderId, value, price_tier: priceTier });
    localStorage.setItem(key, "1");
  }, [paymentId, orderId, value, priceTier]);

  const bundle = downloads[0];
  return <section className="purchase-complete" data-clarity-mask="true">
    <div className="purchase-complete-intro">
      <span className="purchase-complete-mark" aria-hidden="true">✓</span>
      <p>Payment successful</p>
      <h1>Your bundle is ready to download.</h1>
      <span>Verified payment · ₹{value}</span>
    </div>

    <section className="purchase-download-card" aria-labelledby="instant-download-title">
      <div>
        <p>Instant access</p>
        <h2 id="instant-download-title">Download the complete bundle</h2>
        <span>The complete ZIP includes all six CareerPilot resources.</span>
      </div>
      <a className="bundle-download" href={bundle.url} onClick={() => track("bundle_downloaded", { file: "complete_bundle" })}>
        Download ZIP <span aria-hidden="true">↓</span>
      </a>
      <small>This private link expires in 15 minutes.</small>
    </section>

    <section className="purchase-delivery-status" aria-label="Order delivery status">
      <article><span aria-hidden="true">1</span><div><b>Payment verified</b><p>Razorpay confirmed your payment securely.</p></div></article>
      <article><span aria-hidden="true">2</span><div><b>Download ready</b><p>Your complete ZIP is available above now.</p></div></article>
      <article><span aria-hidden="true">3</span><div><b>{deliveryStatus === "sent" ? "Backup email sent" : "Backup email processing"}</b><p>{deliveryStatus === "sent" ? "A seven-day backup link was sent to your email." : "We’re preparing a seven-day backup link for your email."}</p></div></article>
    </section>

    <details className="individual-downloads">
      <summary>Need a single file instead? <span aria-hidden="true">+</span></summary>
      <div>{downloads.slice(1).map((item) => <a key={item.label} href={item.url} onClick={() => track("bundle_downloaded", { file: item.label })}>{item.label}<span aria-hidden="true">↓</span></a>)}</div>
    </details>
    <p className="purchase-help">Keep this page open until your download starts. Need help? <a href="mailto:arkzlab@gmail.com">Contact support</a>.</p>
  </section>;
}
