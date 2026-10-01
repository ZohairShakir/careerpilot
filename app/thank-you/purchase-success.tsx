"use client";

import { useEffect } from "react";
import { track } from "../analytics";

export default function PurchaseSuccess({ paymentId, orderId, value, downloads }: { paymentId: string; orderId: string; value: number; downloads: { label: string; url: string }[] }) {
  useEffect(() => {
    const key = `careerpilot_purchase_tracked_${paymentId}`;
    if (localStorage.getItem(key)) return;
    track("payment_captured", { paymentId, orderId, value });
    localStorage.setItem(key, "1");
  }, [paymentId, orderId, value]);
  return <section className="success" data-clarity-mask="true"><p className="eyebrow">Payment successful</p><h1>Thank you. Your bundle is ready.</h1><p>Your payment of ₹{value} is confirmed. Download your six resources below.</p><a className="bundle-download" href={downloads[0].url} onClick={() => track("bundle_downloaded", { file: "complete_bundle" })}>Download complete bundle ↓</a><details className="individual-downloads"><summary>Prefer individual files?</summary><div>{downloads.slice(1).map(item => <a key={item.label} href={item.url} onClick={() => track("bundle_downloaded", { file: item.label })}>{item.label} ↓</a>)}</div></details><p className="expiry-note">Download links expire 15 minutes after payment confirmation.</p><p>Need help? <a href="mailto:arkzlab@gmail.com">Contact support</a>.</p></section>;
}
