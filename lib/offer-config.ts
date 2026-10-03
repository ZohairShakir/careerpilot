export const OFFER_CONFIG = {
  REGULAR_PRICE: 499,
  LAUNCH_PRICE: 149,
  POST_LAUNCH_PRICE: 299,
  LAUNCH_CAP: 20,
  RESERVATION_MINUTES: 15,
} as const;

export type PriceTier = "launch_149" | "regular_299" | "legacy";
export type OfferStatus = { launchActive: boolean; spotsLeft: number | null; currentPrice: number; regularPrice: number };
export const priceTier = (price: number): PriceTier => price === OFFER_CONFIG.LAUNCH_PRICE ? "launch_149" : "regular_299";

export function launchEnabled() { return process.env.LAUNCH_ENABLED !== "false"; }
export function offerCampaign() {
  const key = process.env.RAZORPAY_KEY_ID || "";
  if (key.startsWith("rzp_test_")) return `test:${process.env.LAUNCH_TEST_RUN || "default"}`;
  if (key.startsWith("rzp_live_")) return "live:launch-v1";
  throw new Error("A server Razorpay test or live key is required");
}
