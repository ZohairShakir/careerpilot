const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const ADMIN_SESSION_TTL_SECONDS = 8 * 60 * 60;

type AdminSession = {
  v: 1;
  sub: "career-pilot-admin";
  iat: number;
  exp: number;
  jti: string;
};

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 8192) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

function base64UrlToBytes(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const binary = atob(normalized + "=".repeat((4 - normalized.length % 4) % 4));
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

function sessionKeyMaterial() {
  const user = process.env.ANALYTICS_DASHBOARD_USER;
  const credential = process.env.ANALYTICS_DASHBOARD_PASSWORD_HASH || process.env.ANALYTICS_DASHBOARD_PASSWORD;
  if (!user || !credential) return null;
  return ["career-pilot-admin-session-v1", process.env.ADMIN_SESSION_SECRET || "", user, credential].join("\n");
}

async function signingKey() {
  const material = sessionKeyMaterial();
  if (!material) return null;
  return crypto.subtle.importKey("raw", encoder.encode(material), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export function adminSessionCookieName() {
  return process.env.NODE_ENV === "production" ? "__Host-careerpilot-admin" : "careerpilot-admin";
}

export function isAdminAuthConfigured() {
  return Boolean(sessionKeyMaterial());
}

export function safeAdminDestination(value: string | null | undefined) {
  if (!value || value.startsWith("//") || value.includes("\\")) return "/admin/analytics";
  try {
    const parsed = new URL(value, "https://careerpilot.store");
    const isAdminPath = parsed.pathname === "/admin" || parsed.pathname.startsWith("/admin/");
    if (parsed.origin !== "https://careerpilot.store" || !isAdminPath || parsed.pathname === "/admin/login") return "/admin/analytics";
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return "/admin/analytics";
  }
}

export async function createAdminSession() {
  const key = await signingKey();
  if (!key) throw new Error("Admin authentication is not configured");
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload: AdminSession = {
    v: 1,
    sub: "career-pilot-admin",
    iat: issuedAt,
    exp: issuedAt + ADMIN_SESSION_TTL_SECONDS,
    jti: crypto.randomUUID(),
  };
  const body = bytesToBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return `${body}.${bytesToBase64Url(new Uint8Array(signature))}`;
}

export async function verifyAdminSession(token: string | null | undefined) {
  if (!token || token.length > 2048) return false;
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false;
  try {
    const key = await signingKey();
    if (!key) return false;
    const validSignature = await crypto.subtle.verify("HMAC", key, base64UrlToBytes(parts[1]), encoder.encode(parts[0]));
    if (!validSignature) return false;
    const payload = JSON.parse(decoder.decode(base64UrlToBytes(parts[0]))) as Partial<AdminSession>;
    const now = Math.floor(Date.now() / 1000);
    return payload.v === 1
      && payload.sub === "career-pilot-admin"
      && typeof payload.iat === "number"
      && typeof payload.exp === "number"
      && typeof payload.jti === "string"
      && payload.iat <= now + 60
      && payload.exp > now
      && payload.exp - payload.iat <= ADMIN_SESSION_TTL_SECONDS;
  } catch {
    return false;
  }
}
