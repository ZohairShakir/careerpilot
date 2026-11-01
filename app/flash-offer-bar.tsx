"use client";

import PurchaseButton from "./purchase-button";
import { useOffer } from "./offer-provider";

function clock(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function FlashOfferBar() {
  const { offer, secondsRemaining } = useOffer();
  if (!offer.flashExpiresAt) return null;

  const active = offer.flashActive && secondsRemaining > 0;
  return <aside className={`flash-offer-bar ${active ? "is-active" : "is-expired"}`} aria-label="Limited-time Career Pilot offer">
    <div className="shell flash-offer-inner">
      <div className="flash-offer-message">
        <span>{active ? "10-minute welcome offer" : "Welcome offer ended"}</span>
        <div className="flash-offer-price">
          {active ? <><del>₹{offer.regularPrice}</del><strong>₹{offer.currentPrice}</strong></> : <strong>₹{offer.currentPrice}</strong>}
        </div>
      </div>
      <div className="flash-offer-timer">
        <span>{active ? "Your price expires in" : "Your timer has ended"}</span>
        <time dateTime={`PT${secondsRemaining}S`} suppressHydrationWarning>{clock(secondsRemaining)}</time>
      </div>
      <PurchaseButton compact label={active ? "Get it now" : "Get the bundle"} />
    </div>
  </aside>;
}
