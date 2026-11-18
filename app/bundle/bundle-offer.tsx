"use client";

import { useOffer } from "../offer-provider";

export default function BundleOffer() {
  const { offer, secondsRemaining } = useOffer();
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = String(secondsRemaining % 60).padStart(2, "0");

  return <div className="bundle-price" aria-label={`Current price ₹${offer.currentPrice}`}>
    <div className="bundle-price-line"><del>₹{offer.regularPrice}</del><strong>₹{offer.currentPrice}</strong></div>
    {offer.flashActive ? <p>₹100 welcome price · {minutes}:{seconds} remaining</p> : <p>One-time payment</p>}
  </div>;
}
