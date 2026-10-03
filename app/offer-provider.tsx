"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { OfferStatus } from "../lib/offer-config";

const Context = createContext<{ offer: OfferStatus; refresh: () => Promise<void> } | null>(null);
export default function OfferProvider({ initialOffer, children }: { initialOffer: OfferStatus; children: React.ReactNode }) {
  const [offer, setOffer] = useState({ ...initialOffer, spotsLeft: null } as OfferStatus);
  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/offer-status", { cache: "no-store" });
      if (!response.ok) throw new Error("Offer status unavailable");
      const next = await response.json() as OfferStatus;
      if (typeof next.launchActive !== "boolean" || typeof next.spotsLeft !== "number" || !Number.isFinite(next.currentPrice) || next.currentPrice <= 0) throw new Error("Invalid offer status");
      setOffer(next);
    } catch { setOffer(previous => ({ ...previous, spotsLeft: null })); }
  }, []);
  useEffect(() => {
    void refresh();
    const tick = () => { if (!document.hidden) void refresh(); };
    const timer = window.setInterval(tick, 20000);
    window.addEventListener("focus",tick);
    document.addEventListener("visibilitychange",tick);
    return () => { window.clearInterval(timer); window.removeEventListener("focus",tick); document.removeEventListener("visibilitychange",tick); };
  }, [refresh]);
  return <Context.Provider value={{ offer, refresh }}>{children}</Context.Provider>;
}
export function useOffer() {
  const value = useContext(Context);
  if (!value) throw new Error("OfferProvider is required");
  return value;
}
