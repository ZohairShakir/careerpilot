"use client";

import { lazy, Suspense, useState, type ReactNode } from "react";
import { track } from "./analytics";
import { priceTier } from "../lib/offer-config";
import { useOffer } from "./offer-provider";

export type PurchaseButtonProps = { compact?: boolean; light?: boolean; label?: string; offerToken?: string | null; source?: "job_fit_offer"; prefillName?: string; prefillEmail?: string; placement?: string; className?: string; ariaLabel?: string; children?: ReactNode };

const PurchaseModal = lazy(() => import("./purchase-modal"));
const preloadCheckout = () => { void import("./purchase-modal").catch(() => {}); };

export default function PurchaseButton(props: PurchaseButtonProps) {
  const { compact, light, label, source, placement, className, ariaLabel, children } = props;
  const { offer } = useOffer();
  const [open, setOpen] = useState(false);

  function openModal() {
    const trackedPlacement = placement || source || (compact ? "header" : light ? "purchase_section" : "hero");
    track("bundle_cta_clicked", { placement: trackedPlacement, value: offer.currentPrice, price_tier: priceTier(offer.currentPrice) });
    if (source === "job_fit_offer") {
      track("checkout_clicked", { placement: trackedPlacement });
      track("offer_clicked_after_lead");
    }
    track("checkout_opened");
    setOpen(true);
  }

  return <>
    <button type="button" className={className || `buy-button ${compact ? "compact" : ""} ${light ? "light" : ""}`} aria-label={ariaLabel} onPointerEnter={preloadCheckout} onFocus={preloadCheckout} onClick={openModal}>{children || (label ? `${label} — ₹${offer.currentPrice}` : `Get it now — ₹${offer.currentPrice}`)}</button>
    {open ? <Suspense fallback={<div className="modal-backdrop"><section className="checkout-modal"><button className="close" aria-label="Close checkout" onClick={() => setOpen(false)}>×</button><p role="status">Opening checkout…</p></section></div>}>
      <PurchaseModal {...props} onClose={() => setOpen(false)} />
    </Suspense> : null}
  </>;
}
