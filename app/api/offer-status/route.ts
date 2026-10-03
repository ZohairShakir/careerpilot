import { NextResponse } from "next/server";
import { getOfferStatus } from "../../../lib/launch-offer";

export async function GET() {
  try {
    return NextResponse.json(await getOfferStatus(), { headers: { "Cache-Control": "public, max-age=0, s-maxage=15, must-revalidate" } });
  } catch {
    return NextResponse.json({ error: "Offer availability is temporarily unavailable. Price is confirmed at checkout." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
