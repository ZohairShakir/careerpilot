import { NextRequest, NextResponse } from "next/server";
import { adminSessionCookieName, isAdminAuthConfigured, verifyAdminSession } from "./lib/admin-session";

function secureAdminResponse(response: NextResponse) {
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("Content-Security-Policy", "frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  if (process.env.NODE_ENV === "production") response.headers.set("Strict-Transport-Security", "max-age=31536000");
  return response;
}

export async function middleware(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === "/admin/login";
  const cookieName = adminSessionCookieName();
  const token = request.cookies.get(cookieName)?.value;
  const authenticated = isAdminAuthConfigured() && await verifyAdminSession(token);

  if (isLoginPage) {
    if (authenticated) return secureAdminResponse(NextResponse.redirect(new URL("/admin/analytics", request.url)));
    return secureAdminResponse(NextResponse.next());
  }

  if (authenticated) return secureAdminResponse(NextResponse.next());

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  if (!isAdminAuthConfigured()) loginUrl.searchParams.set("error", "unavailable");
  else if (token) loginUrl.searchParams.set("error", "session");
  const response = secureAdminResponse(NextResponse.redirect(loginUrl));
  if (token) response.cookies.set(cookieName, "", { path: "/", maxAge: 0 });
  return response;
}

export const config = { matcher: "/admin/:path*" };
