import { NextResponse } from "next/server";
import { bestEffort, supabaseRequest } from "../../../../lib/supabase";

const EVENTS = new Set(["page_view", "bundle_cta_clicked", "checkout_opened", "checkout_details_submitted", "razorpay_opened", "checkout_dismissed", "payment_failed", "payment_captured", "bundle_downloaded"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!EVENTS.has(body.event) || typeof body.sessionId !== "string" || !UUID.test(body.sessionId)) return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    const attribution = body.attribution || {};
    const safeMetadata = typeof body.metadata === "object" && body.metadata ? body.metadata : {};
    const now = new Date().toISOString();
    await bestEffort(async () => {
      await supabaseRequest("visitor_sessions?on_conflict=session_id", {
          method: "POST",
          body: JSON.stringify({ session_id: body.sessionId, first_referrer: String(attribution.referrer || "").slice(0, 500), utm_source: String(attribution.source || "").slice(0, 120), utm_medium: String(attribution.medium || "").slice(0, 120), utm_campaign: String(attribution.campaign || "").slice(0, 160), last_seen_at: now }),
        }, "resolution=merge-duplicates");
      await supabaseRequest("analytics_events", {
          method: "POST",
          body: JSON.stringify({ session_id: body.sessionId, event_name: body.event, page_path: String(body.pagePath || "/").slice(0, 300), referrer: String(attribution.referrer || "").slice(0, 500), utm_source: String(attribution.source || "").slice(0, 120), utm_medium: String(attribution.medium || "").slice(0, 120), utm_campaign: String(attribution.campaign || "").slice(0, 160), metadata: safeMetadata, user_agent: (request.headers.get("user-agent") || "").slice(0, 500) }),
        });
      const orderId = typeof safeMetadata.orderId === "string" ? safeMetadata.orderId : "";
      const statuses: Record<string, string> = { razorpay_opened: "razorpay_opened", checkout_dismissed: "abandoned", payment_failed: "failed", payment_captured: "captured" };
      if (orderId && statuses[body.event]) await supabaseRequest(`checkout_attempts?razorpay_order_id=eq.${encodeURIComponent(orderId)}`, { method: "PATCH", body: JSON.stringify({ status: statuses[body.event], updated_at: now }) });
    });
    return new NextResponse(null, { status: 204 });
  } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
}
