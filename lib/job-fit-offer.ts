import crypto from "node:crypto";

const OFFER_TTL_MS = 24 * 60 * 60 * 1000;

function secret() {
  return process.env.JOB_FIT_FINGERPRINT_SECRET || process.env.DOWNLOAD_SIGNING_SECRET || "";
}

function signature(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createJobFitOfferToken() {
  if (!secret()) return null;
  const payload = `jobfit.${Date.now() + OFFER_TTL_MS}.${crypto.randomUUID()}`;
  return `${payload}.${signature(payload)}`;
}

export function hasValidJobFitOffer(token: unknown) {
  if (typeof token !== "string" || !secret()) return false;
  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== "jobfit") return false;
  const payload = parts.slice(0, 3).join(".");
  const expected = Buffer.from(signature(payload));
  const supplied = Buffer.from(parts[3]);
  const expiresAt = Number(parts[1]);
  return Number.isFinite(expiresAt) && expiresAt > Date.now() && expected.length === supplied.length && crypto.timingSafeEqual(expected, supplied);
}
