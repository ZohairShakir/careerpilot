"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "./analytics";
import { useOffer } from "./offer-provider";
import { priceTier } from "../lib/offer-config";

export default function AnalyticsProvider() {
  const pathname = usePathname();
  const { offer } = useOffer();
  const isAdmin = pathname.startsWith("/admin");
  useEffect(() => {
    if (!isAdmin) track("page_view", { pageTitle: document.title, value: offer.currentPrice, price_tier: priceTier(offer.currentPrice) });
  }, [isAdmin, pathname]);
  return null;
}
