import { NextResponse } from "next/server";
import { cookieValue, flashOfferCookieName } from "../../../lib/flash-offer";
import { effectiveOfferStatus } from "../../../lib/launch-offer";

export async function GET(request: Request) {
  try {
    const token = cookieValue(request.headers.get("cookie"), flashOfferCookieName());
    return NextResponse.json(await effectiveOfferStatus(token), { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Offer availability is temporarily unavailable. Price is confirmed at checkout." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
