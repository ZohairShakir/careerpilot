"use client";

export type FunnelEvent =
  | "page_view"
  | "bundle_cta_clicked"
  | "checkout_opened"
  | "checkout_details_submitted"
  | "razorpay_opened"
  | "checkout_dismissed"
  | "payment_failed"
  | "payment_captured"
  | "bundle_downloaded";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const SESSION_KEY = "careerpilot_session_v1";
const ATTRIBUTION_KEY = "careerpilot_attribution_v1";

type Attribution = { source: string; medium: string; campaign: string; content: string; term: string; referrer: string };

function sessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(SESSION_KEY, id); }
  return id;
}

function attribution(): Attribution {
  const existing = localStorage.getItem(ATTRIBUTION_KEY);
  if (existing) return JSON.parse(existing) as Attribution;
  const params = new URLSearchParams(location.search);
  const value = {
    source: params.get("utm_source") || "",
    medium: params.get("utm_medium") || "",
    campaign: params.get("utm_campaign") || "",
    content: params.get("utm_content") || "",
    term: params.get("utm_term") || "",
    referrer: document.referrer || "",
  };
  localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(value));
  return value;
}

export function analyticsContext() {
  return { sessionId: sessionId(), attribution: attribution() };
}

export function track(event: FunnelEvent, metadata: Record<string, string | number | boolean> = {}) {
  const context = analyticsContext();
  const payload = JSON.stringify({ event, ...context, pagePath: location.pathname, metadata });
  if (navigator.sendBeacon) navigator.sendBeacon("/api/analytics/event", payload);
  else void fetch("/api/analytics/event", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true });

  window.gtag?.("event", event === "payment_captured" ? "purchase" : event === "checkout_details_submitted" ? "begin_checkout" : event, {
    page_location: location.href,
    page_path: location.pathname,
    currency: "INR",
    value: event === "payment_captured" || event === "checkout_details_submitted" ? 499 : undefined,
    transaction_id: metadata.paymentId,
    items: [{ item_id: "career-pilot-bundle", item_name: "Career Pilot AI Job Search Bundle", price: 499, quantity: 1 }],
    ...metadata,
  });
}
