"use client";
import { OFFER_CONFIG } from "../lib/offer-config";
import { useOffer } from "./offer-provider";

export default function OfferPrice({ kind = "hero" }: { kind?: "hero" | "section" | "sticky" | "fit" }) {
  const { offer, secondsRemaining } = useOffer();
  if (kind === "sticky") return <span className="sticky-offer-price">{offer.flashActive ? <del>₹{offer.regularPrice}</del> : null}<b>₹{offer.currentPrice}</b></span>;
  const className = kind === "hero" ? "sales-hero-price" : kind === "section" ? "sales-offer-price" : "fit-offer-price";
  return <div className={`${className} offer-pricing`}>
    <div className="offer-price-line">{offer.flashActive || offer.launchActive ? <del aria-label={`Regular price ₹${offer.regularPrice}`}>₹{offer.regularPrice}</del> : null}<b>₹{offer.currentPrice}</b><span>one-time</span></div>
    {offer.flashActive ? <div className="offer-availability flash"><small>₹100 welcome price</small><small suppressHydrationWarning>{Math.floor(secondsRemaining / 60)}:{String(secondsRemaining % 60).padStart(2, "0")} remaining</small></div> : offer.launchActive ? <div className="offer-availability"><small>Launch price: first {OFFER_CONFIG.LAUNCH_CAP} buyers</small>{offer.spotsLeft !== null ? <small data-offer-spots>{offer.spotsLeft} of {OFFER_CONFIG.LAUNCH_CAP} spots left</small> : null}</div> : null}
  </div>;
}
export function OfferTerms() {
  const { offer } = useOffer();
  if (offer.flashActive) return <p className="offer-terms">Complete the short checkout form before the timer ends to lock your ₹100 price for 15 minutes.</p>;
  return offer.launchActive ? <p className="offer-terms">Launch price ends after the first {OFFER_CONFIG.LAUNCH_CAP} buyers. After that, the bundle moves to ₹{OFFER_CONFIG.POST_LAUNCH_PRICE}.</p> : null;
}
export function PurchaseTrust() { return <p className="sales-trust">Instant access · 7-day refund · Secure Razorpay checkout</p>; }
export function LaunchFaq() {
  const { offer } = useOffer();
  if (offer.flashActive) return <details><summary>Why is it ₹100 right now?<span>+</span></summary><p>It’s a 10-minute welcome offer for this browser. Submit the checkout form before the timer ends and Razorpay will hold the ₹100 order for 15 minutes.</p></details>;
  return offer.launchActive ? <details><summary>Why ₹{OFFER_CONFIG.LAUNCH_PRICE}?<span>+</span></summary><p>It’s a launch price for the first {OFFER_CONFIG.LAUNCH_CAP} buyers. After that, the price is ₹{OFFER_CONFIG.POST_LAUNCH_PRICE}.</p></details> : null;
}
