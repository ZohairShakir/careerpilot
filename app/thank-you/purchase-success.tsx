"use client";

import { useEffect } from "react";
import { track } from "../analytics";

export default function PurchaseSuccess({ paymentId, orderId, value, priceTier, downloads, deliveryStatus }: { paymentId: string; orderId: string; value: number; priceTier: string; downloads: { label: string; url: string }[]; deliveryStatus: "sent" | "pending" }) {
  useEffect(() => {
    const key = `careerpilot_purchase_tracked_${orderId}`;
    if (localStorage.getItem(key)) return;
    track("payment_captured", { paymentId, orderId, value, price_tier: priceTier });
    localStorage.setItem(key, "1");
  }, [paymentId, orderId, value, priceTier]);
  return <section className="success" data-clarity-mask="true"><p className="eyebrow">Payment successful</p><h1>Thank you. Your bundle is ready.</h1><p>Your verified payment of ₹{value} is confirmed. {deliveryStatus === "sent" ? "A secure download email has been sent to you." : "Your secure download email is being processed."} You can also download everything immediately below.</p><a className="bundle-download" href={downloads[0].url} onClick={() => track("bundle_downloaded", { file: "complete_bundle" })}>Download complete bundle ↓</a><details className="individual-downloads"><summary>Prefer individual files?</summary><div>{downloads.slice(1).map(item => <a key={item.label} href={item.url} onClick={() => track("bundle_downloaded", { file: item.label })}>{item.label} ↓</a>)}</div></details><p className="expiry-note">These page links expire 15 minutes after payment confirmation. The emailed bundle link remains available for 7 days.</p><p>Need help? <a href="mailto:arkzlab@gmail.com">Contact support</a>.</p></section>;
}
