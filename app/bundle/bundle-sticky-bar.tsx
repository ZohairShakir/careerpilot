"use client";

import PurchaseButton from "../purchase-button";
import { useOffer } from "../offer-provider";
import Image from "next/image";

export default function BundleStickyBar() {
  const { offer } = useOffer();
  return <PurchaseButton className="bundle-sticky-bar" ariaLabel="Get the CareerPilot bundle" placement="bundle_sticky_bar">
    <span className="bundle-sticky-product">
      <Image src="/assets/careerpilot-bundle-gallery.png" alt="" width={1254} height={1254} sizes="56px" />
      <span><strong>CareerPilot Bundle</strong><small>6 digital resources</small><em><del>₹{offer.regularPrice}</del> ₹{offer.currentPrice}</em></span>
    </span>
    <span className="bundle-sticky-cta" aria-hidden="true">Get it now</span>
  </PurchaseButton>;
}
