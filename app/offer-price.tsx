"use client";
import { OFFER_CONFIG } from "../lib/offer-config";
import { useOffer } from "./offer-provider";

export default function OfferPrice({ kind = "hero" }: { kind?: "hero" | "section" | "sticky" | "fit" }) {
  const { offer } = useOffer();
  if (kind === "sticky") return <b>₹{offer.currentPrice}</b>;
  const className = kind === "hero" ? "sales-hero-price" : kind === "section" ? "sales-offer-price" : "fit-offer-price";
  return <div className={`${className} offer-pricing`}>
    <div className="offer-price-line">{offer.launchActive ? <del aria-label={`Regular price ₹${offer.regularPrice}`}>₹{offer.regularPrice}</del> : null}<b>₹{offer.currentPrice}</b><span>one-time</span></div>
    {offer.launchActive ? <div className="offer-availability"><small>Launch price: first {OFFER_CONFIG.LAUNCH_CAP} buyers</small>{offer.spotsLeft !== null ? <small data-offer-spots>{offer.spotsLeft} of {OFFER_CONFIG.LAUNCH_CAP} spots left</small> : null}</div> : null}
  </div>;
}
export function OfferTerms() {
  const { offer } = useOffer();
  return offer.launchActive ? <p className="offer-terms">Launch price ends after the first {OFFER_CONFIG.LAUNCH_CAP} buyers. After that, the bundle moves to ₹{OFFER_CONFIG.POST_LAUNCH_PRICE}.</p> : null;
}
export function PurchaseTrust() { return <p className="sales-trust">Instant access · 7-day refund · Secure Razorpay checkout</p>; }
export function LaunchFaq() {
  const { offer } = useOffer();
  return offer.launchActive ? <details><summary>Why ₹{OFFER_CONFIG.LAUNCH_PRICE}?<span>+</span></summary><p>It’s a launch price for the first {OFFER_CONFIG.LAUNCH_CAP} buyers. After that, the price is ₹{OFFER_CONFIG.POST_LAUNCH_PRICE}.</p></details> : null;
}
