import { cache } from "react";
import { supabaseRequest } from "./supabase";
import { readFlashOffer } from "./flash-offer";
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
  return { ...result, fallbackPrice: result.currentPrice, regularPrice: OFFER_CONFIG.REGULAR_PRICE, flashActive: false, flashExpiresAt: null };
});
export async function effectiveOfferStatus(token?: string | null): Promise<OfferStatus> {
  const base = await getOfferStatus();
  const flash = await readFlashOffer(token);
  return flash.active
    ? { ...base, currentPrice: OFFER_CONFIG.FLASH_PRICE, flashActive: true, flashExpiresAt: flash.expiresAt }
    : { ...base, flashExpiresAt: flash.valid ? flash.expiresAt : null };
}
export async function initialOfferStatus(token?: string | null): Promise<OfferStatus> {
  try { return await effectiveOfferStatus(token); }
  catch {
    const currentPrice = launchEnabled() ? OFFER_CONFIG.LAUNCH_PRICE : OFFER_CONFIG.POST_LAUNCH_PRICE;
    const flash = await readFlashOffer(token);
    return {
      launchActive: launchEnabled(), spotsLeft: null, currentPrice: flash.active ? OFFER_CONFIG.FLASH_PRICE : currentPrice,
      fallbackPrice: currentPrice, regularPrice: OFFER_CONFIG.REGULAR_PRICE, flashActive: flash.active, flashExpiresAt: flash.expiresAt,
    };
  }
}
export type Reservation = { id: string; amount: number; price_tier: PriceTier; expires_at: string; campaign: string };
