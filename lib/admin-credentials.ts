import "server-only";
import { createHash, scryptSync, timingSafeEqual } from "node:crypto";

function safeTextEqual(input: string, expected: string) {
  const inputDigest = createHash("sha256").update(input).digest();
  const expectedDigest = createHash("sha256").update(expected).digest();
  return timingSafeEqual(inputDigest, expectedDigest);
}

function verifyScryptPassword(password: string, encoded: string) {
  const [algorithm, nValue, rValue, pValue, saltValue, digestValue] = encoded.split("$");
  if (algorithm !== "scrypt" || !nValue || !rValue || !pValue || !saltValue || !digestValue) return false;
  const N = Number(nValue), r = Number(rValue), p = Number(pValue);
  if (!Number.isInteger(N) || !Number.isInteger(r) || !Number.isInteger(p) || N < 16384 || N > 131072 || r < 8 || r > 16 || p < 1 || p > 10) return false;
  const expected = Buffer.from(digestValue, "base64url");
  const salt = Buffer.from(saltValue, "base64url");
  if (expected.length !== 64 || salt.length < 16) return false;
  const actual = scryptSync(password, salt, expected.length, { N, r, p, maxmem: 192 * 1024 * 1024 });
  return timingSafeEqual(actual, expected);
}

export function verifyAdminCredentials(username: string, password: string) {
  const expectedUser = process.env.ANALYTICS_DASHBOARD_USER || "";
  const passwordHash = process.env.ANALYTICS_DASHBOARD_PASSWORD_HASH;
  const legacyPassword = process.env.ANALYTICS_DASHBOARD_PASSWORD;
  if (!expectedUser || (!passwordHash && !legacyPassword) || username.length > 256 || password.length > 1024) return false;

  const validUser = safeTextEqual(username, expectedUser);
  let validPassword = false;
  try {
    validPassword = passwordHash ? verifyScryptPassword(password, passwordHash) : safeTextEqual(password, legacyPassword || "");
  } catch {
    validPassword = false;
  }
  return validUser && validPassword;
}
