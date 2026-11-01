import { NextRequest, NextResponse } from "next/server";
import { adminSessionCookieName, isAdminAuthConfigured, verifyAdminSession } from "./lib/admin-session";
import { createFlashOfferToken, flashOfferConfigured, flashOfferCookieName, FLASH_OFFER_COOKIE_MAX_AGE, readFlashOffer } from "./lib/flash-offer";

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
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    const cookieName = flashOfferCookieName();
    const existingToken = request.cookies.get(cookieName)?.value;
    const existingOffer = await readFlashOffer(existingToken);
    const shouldCreateOffer = !existingToken && flashOfferConfigured();
    const token = shouldCreateOffer ? await createFlashOfferToken() : existingToken;
    const requestHeaders = new Headers(request.headers);
    if (token && (shouldCreateOffer || existingOffer.valid)) requestHeaders.set("x-careerpilot-offer", token);
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    if (shouldCreateOffer && token) {
      response.cookies.set(cookieName, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: FLASH_OFFER_COOKIE_MAX_AGE,
        priority: "high",
      });
    }
    return response;
  }

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

export const config = { matcher: ["/((?!api|_next|favicon.ico|icon.svg|manifest.webmanifest|robots.txt|sitemap.xml|assets|fonts).*)"] };
