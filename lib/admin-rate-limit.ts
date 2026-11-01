import "server-only";

type Attempt = { count: number; windowStartedAt: number; blockedUntil: number };
type AdminRateLimitGlobal = typeof globalThis & { __careerPilotAdminAttempts?: Map<string, Attempt> };

const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const globalStore = globalThis as AdminRateLimitGlobal;
const attempts = globalStore.__careerPilotAdminAttempts ?? new Map<string, Attempt>();
globalStore.__careerPilotAdminAttempts = attempts;

function prune(now: number) {
  if (attempts.size < 500) return;
  for (const [key, entry] of attempts) {
    if (entry.blockedUntil <= now && entry.windowStartedAt + WINDOW_MS <= now) attempts.delete(key);
  }
}

export function adminLoginLimit(key: string) {
  const now = Date.now();
  prune(now);
  const entry = attempts.get(key);
  if (!entry || entry.blockedUntil <= now) return { allowed: true, retryAfterSeconds: 0 };
  return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((entry.blockedUntil - now) / 1000)) };
}

export function recordAdminLoginFailure(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  const entry = !current || current.windowStartedAt + WINDOW_MS <= now
    ? { count: 0, windowStartedAt: now, blockedUntil: 0 }
    : current;
  entry.count += 1;
  if (entry.count >= MAX_ATTEMPTS) entry.blockedUntil = now + BLOCK_MS;
  attempts.set(key, entry);
  return adminLoginLimit(key);
}

export function clearAdminLoginFailures(key: string) {
  attempts.delete(key);
}
