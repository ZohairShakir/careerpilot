"use client";

import OfferPrice from "./offer-price";
import { useOffer } from "./offer-provider";
import PurchaseButton from "./purchase-button";

export default function MobileBuyBar() {
  const { offer } = useOffer();
  return <PurchaseButton className="mobile-buy-bar" ariaLabel="Open checkout for the Career Pilot bundle" placement="sticky_bar">
    <div><span>Complete bundle</span><OfferPrice kind="sticky" /></div>
    <span className="buy-button compact mobile-buy-cta" aria-hidden="true">Get it now — ₹{offer.currentPrice}</span>
  </PurchaseButton>;
}
