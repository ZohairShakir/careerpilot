import type { Metadata } from "next";
import Link from "next/link";
import { isAdminAuthConfigured, safeAdminDestination } from "../../../lib/admin-session";

export const metadata: Metadata = { title: "Admin sign in" };

type Query = { error?: string | string[]; status?: string | string[]; next?: string | string[] };

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function LockIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.75 10V7.7a4.25 4.25 0 0 1 8.5 0V10M6 10h12v10H6z" /></svg>;
}

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<Query> }) {
  const query = await searchParams;
  const error = first(query.error);
  const signedOut = first(query.status) === "signed_out";
  const next = safeAdminDestination(first(query.next));
  const configured = isAdminAuthConfigured();
  const message = !configured || error === "unavailable"
    ? "Admin access is temporarily unavailable. Check the server authentication settings."
    : error === "rate_limited"
      ? "Too many sign-in attempts. Wait 15 minutes before trying again."
      : error === "session"
        ? "Your secure session expired. Sign in again to continue."
        : error === "invalid"
          ? "The username or password is incorrect."
          : null;

  return <main className="admin-login-page">
    <section className="admin-login-brand" aria-label="Career Pilot administration">
      <Link className="admin-login-wordmark" href="/"><span aria-hidden="true">✦</span>career pilot</Link>
      <div className="admin-login-brand-copy">
        <h1>Your clearest view of the business.</h1>
        <p>Private reporting for acquisition, checkout performance, Job Fit usage, and qualified leads.</p>
      </div>
      <p className="admin-login-domain">careerpilot.store</p>
    </section>

    <section className="admin-login-panel">
      <div className="admin-login-form-wrap">
        <div className="admin-login-lock"><LockIcon /></div>
        <h2>Welcome back.</h2>
        <p className="admin-login-intro">Sign in to open your private Career Pilot analytics workspace.</p>

        {message ? <p className="admin-login-message error" role="alert">{message}</p> : null}
        {signedOut ? <p className="admin-login-message success" role="status">You’ve been signed out securely.</p> : null}

        <form className="admin-login-form" action="/api/admin/login" method="post">
          <input type="hidden" name="next" value={next} />
          <label htmlFor="admin-username">Username</label>
          <input id="admin-username" name="username" type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} required disabled={!configured} />
          <label htmlFor="admin-password">Password</label>
          <input id="admin-password" name="password" type="password" autoComplete="current-password" required disabled={!configured} />
          <button type="submit" disabled={!configured}>Open analytics <span aria-hidden="true">→</span></button>
        </form>

        <div className="admin-login-security">
          <LockIcon />
          <p>Your credentials are exchanged once over HTTPS. Access continues through a time-limited, HttpOnly session.</p>
        </div>
        <Link className="admin-login-return" href="/">Return to the website</Link>
      </div>
    </section>
  </main>;
}
