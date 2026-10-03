import { cache } from "react";
import { supabaseRequest } from "./supabase";
import { OFFER_CONFIG, launchEnabled, offerCampaign, type OfferStatus, type PriceTier } from "./offer-config";

export function offerParameters() {
  return { p_campaign: offerCampaign(), p_enabled: launchEnabled(), p_cap: OFFER_CONFIG.LAUNCH_CAP, p_launch_amount: OFFER_CONFIG.LAUNCH_PRICE * 100, p_regular_amount: OFFER_CONFIG.POST_LAUNCH_PRICE * 100 };
}
export async function offerRpc<T>(name: string, body: Record<string, unknown>) {
  const result = await supabaseRequest<T>(`rpc/${name}`, { method: "POST", body: JSON.stringify(body) });
  if (!result) throw new Error("Launch offer database is not configured");
  return result;
}
export const getOfferStatus = cache(async (): Promise<OfferStatus> => {
  const result = await offerRpc<{ launchActive: boolean; spotsLeft: number; currentPrice: number }>("launch_offer_status", offerParameters());
  return { ...result, regularPrice: OFFER_CONFIG.REGULAR_PRICE };
});
export async function initialOfferStatus(): Promise<OfferStatus> {
  try { return await getOfferStatus(); }
  catch { return { launchActive: launchEnabled(), spotsLeft: null, currentPrice: launchEnabled() ? OFFER_CONFIG.LAUNCH_PRICE : OFFER_CONFIG.POST_LAUNCH_PRICE, regularPrice: OFFER_CONFIG.REGULAR_PRICE }; }
}
export type Reservation = { id: string; amount: number; price_tier: PriceTier; expires_at: string; campaign: string };
