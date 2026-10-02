"use client";

import { lazy, Suspense, useState } from "react";
import { track } from "./analytics";

export type PurchaseButtonProps = { compact?: boolean; light?: boolean; label?: string; offerToken?: string | null; offerPrice?: number; source?: "job_fit_offer"; prefillName?: string; prefillEmail?: string };

const PurchaseModal = lazy(() => import("./purchase-modal"));
const preloadCheckout = () => { void import("./purchase-modal").catch(() => {}); };

export default function PurchaseButton(props: PurchaseButtonProps) {
  const { compact, light, label, offerPrice, source } = props;
  const [open, setOpen] = useState(false);

  function openModal() {
    const placement = source || (compact ? "header" : light ? "purchase_section" : "hero");
    track("bundle_cta_clicked", { placement, value: offerPrice || 499 });
    if (source === "job_fit_offer") {
      track("discount_clicked", { offer: "JOBFIT20", value: offerPrice || 399 });
      track("checkout_clicked", { placement });
      track("offer_clicked_after_lead");
    }
    track("checkout_opened");
    setOpen(true);
  }

  return <>
    <button className={`buy-button ${compact ? "compact" : ""} ${light ? "light" : ""}`} onPointerEnter={preloadCheckout} onFocus={preloadCheckout} onClick={openModal}>{label || (compact ? "Get the bundle" : "Get the complete bundle ? ?499")}</button>
    {open ? <Suspense fallback={<div className="modal-backdrop"><section className="checkout-modal"><button className="close" aria-label="Close checkout" onClick={() => setOpen(false)}>?</button><p role="status">Opening checkout?</p></section></div>}>
      <PurchaseModal {...props} onClose={() => setOpen(false)} />
    </Suspense> : null}
  </>;
}
