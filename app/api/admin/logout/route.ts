import { NextRequest, NextResponse } from "next/server";
import { adminSessionCookieName } from "../../../../lib/admin-session";

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = (request.headers.get("x-forwarded-host") || request.headers.get("host"))?.split(",")[0]?.trim();
  if (!origin || !host) return false;
  try {
    const protocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || request.nextUrl.protocol.replace(":", "");
    return new URL(origin).origin === `${protocol}://${host}`;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return new NextResponse("Invalid request origin.", { status: 403, headers: { "Cache-Control": "no-store" } });
  const url = new URL("/admin/login", request.url);
  url.searchParams.set("status", "signed_out");
  const response = NextResponse.redirect(url, { status: 303 });
  response.cookies.set(adminSessionCookieName(), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  return response;
}
