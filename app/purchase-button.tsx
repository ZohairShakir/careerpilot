"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { track } from "./analytics";
import { priceTier } from "../lib/offer-config";
import { useOffer } from "./offer-provider";

export type PurchaseButtonProps = { compact?: boolean; light?: boolean; label?: string; offerToken?: string | null; source?: "job_fit_offer"; prefillName?: string; prefillEmail?: string; placement?: string; className?: string; ariaLabel?: string; children?: ReactNode };

export default function PurchaseButton(props: PurchaseButtonProps) {
  const { compact, light, label, source, placement, className, ariaLabel, children } = props;
  const { offer } = useOffer();
  const router = useRouter();

  function openCart() {
    const trackedPlacement = placement || source || (compact ? "header" : light ? "purchase_section" : "hero");
    track("bundle_cta_clicked", { placement: trackedPlacement, value: offer.currentPrice, price_tier: priceTier(offer.currentPrice) });
    if (source === "job_fit_offer") {
      track("checkout_clicked", { placement: trackedPlacement });
      track("offer_clicked_after_lead");
    }
    router.push(`/cart?placement=${encodeURIComponent(trackedPlacement)}${source ? `&source=${encodeURIComponent(source)}` : ""}`);
  }

  return <button type="button" className={className || `buy-button ${compact ? "compact" : ""} ${light ? "light" : ""}`} aria-label={ariaLabel} onClick={openCart}>{children || (label ? `${label} — ₹${offer.currentPrice}` : `Get it now — ₹${offer.currentPrice}`)}</button>;
}
