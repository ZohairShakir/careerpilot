import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const expectedUser = process.env.ANALYTICS_DASHBOARD_USER;
  const expectedPassword = process.env.ANALYTICS_DASHBOARD_PASSWORD;
  if (!expectedUser || !expectedPassword) return new NextResponse("Analytics dashboard is not configured.", { status: 503 });
  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Basic ")) {
    try {
      const [user, password] = atob(authorization.slice(6)).split(":");
      if (user === expectedUser && password === expectedPassword) return NextResponse.next();
    } catch { /* invalid authorization header */ }
  }
  return new NextResponse("Authentication required.", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Career Pilot Analytics"' } });
}

export const config = { matcher: "/admin/analytics/:path*" };
