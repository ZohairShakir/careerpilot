import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCredentials } from "../../../../lib/admin-credentials";
import { adminLoginLimit, clearAdminLoginFailures, recordAdminLoginFailure } from "../../../../lib/admin-rate-limit";
import { ADMIN_SESSION_TTL_SECONDS, adminSessionCookieName, createAdminSession, isAdminAuthConfigured, safeAdminDestination } from "../../../../lib/admin-session";

export const runtime = "nodejs";

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

function clientKey(request: NextRequest) {
  const address = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return createHash("sha256").update(address).digest("hex");
}

function secured(response: NextResponse) {
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  return response;
}

function loginRedirect(request: NextRequest, next: string, error: string, retryAfter?: number) {
  const url = new URL("/admin/login", request.url);
  url.searchParams.set("error", error);
  url.searchParams.set("next", next);
  const response = secured(NextResponse.redirect(url, { status: 303 }));
  if (retryAfter) response.headers.set("Retry-After", String(retryAfter));
  return response;
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return secured(new NextResponse("Invalid request origin.", { status: 403 }));
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (!Number.isFinite(contentLength) || contentLength > 8192) return secured(new NextResponse("Request too large.", { status: 413 }));

  const form = await request.formData();
  const next = safeAdminDestination(typeof form.get("next") === "string" ? String(form.get("next")) : null);
  if (!isAdminAuthConfigured()) return loginRedirect(request, next, "unavailable");

  const key = clientKey(request);
  const limit = adminLoginLimit(key);
  if (!limit.allowed) return loginRedirect(request, next, "rate_limited", limit.retryAfterSeconds);

  const username = typeof form.get("username") === "string" ? String(form.get("username")) : "";
  const password = typeof form.get("password") === "string" ? String(form.get("password")) : "";
  if (!verifyAdminCredentials(username, password)) {
    const updatedLimit = recordAdminLoginFailure(key);
    await new Promise(resolve => setTimeout(resolve, 350));
    return loginRedirect(request, next, updatedLimit.allowed ? "invalid" : "rate_limited", updatedLimit.retryAfterSeconds || undefined);
  }

  clearAdminLoginFailures(key);
  const response = secured(NextResponse.redirect(new URL(next, request.url), { status: 303 }));
  response.cookies.set({
    name: adminSessionCookieName(),
    value: await createAdminSession(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
    priority: "high",
  });
  return response;
}
