import { OFFER_CONFIG } from "./offer-config";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const FLASH_OFFER_COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

type FlashOfferPayload = {
  v: 1;
  sub: "career-pilot-flash-offer";
  iat: number;
  exp: number;
  jti: string;
};

export type FlashOfferState = {
  valid: boolean;
  active: boolean;
  expiresAt: string | null;
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

function signingMaterial() {
  const secret = process.env.FLASH_OFFER_SECRET;
  return secret ? `career-pilot-flash-offer-v1\n${secret}` : null;
}

async function signingKey() {
  const material = signingMaterial();
  if (!material) return null;
  return crypto.subtle.importKey("raw", encoder.encode(material), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

function validPayload(payload: Partial<FlashOfferPayload>) {
  const maximumDuration = OFFER_CONFIG.FLASH_MINUTES * 60;
  return payload.v === 1
    && payload.sub === "career-pilot-flash-offer"
    && typeof payload.iat === "number"
    && typeof payload.exp === "number"
    && typeof payload.jti === "string"
    && payload.exp > payload.iat
    && payload.exp - payload.iat === maximumDuration
    && payload.iat <= Math.floor(Date.now() / 1000) + 60;
}

export function flashOfferCookieName() {
  return process.env.NODE_ENV === "production" ? "__Host-careerpilot-offer" : "careerpilot-offer";
}

export function flashOfferConfigured() {
  return Boolean(signingMaterial());
}

export function cookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() === name) return decodeURIComponent(part.slice(separator + 1).trim());
  }
  return null;
}

export async function createFlashOfferToken() {
  const key = await signingKey();
  if (!key) throw new Error("Flash offer signing is not configured");
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload: FlashOfferPayload = {
    v: 1,
    sub: "career-pilot-flash-offer",
    iat: issuedAt,
    exp: issuedAt + OFFER_CONFIG.FLASH_MINUTES * 60,
    jti: crypto.randomUUID(),
  };
  const body = bytesToBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return `${body}.${bytesToBase64Url(new Uint8Array(signature))}`;
}

export async function readFlashOffer(token: string | null | undefined): Promise<FlashOfferState> {
  if (!token || token.length > 2048) return { valid: false, active: false, expiresAt: null };
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return { valid: false, active: false, expiresAt: null };
  try {
    const key = await signingKey();
    if (!key) return { valid: false, active: false, expiresAt: null };
    const signatureValid = await crypto.subtle.verify("HMAC", key, base64UrlToBytes(parts[1]), encoder.encode(parts[0]));
    if (!signatureValid) return { valid: false, active: false, expiresAt: null };
    const payload = JSON.parse(decoder.decode(base64UrlToBytes(parts[0]))) as Partial<FlashOfferPayload>;
    if (!validPayload(payload)) return { valid: false, active: false, expiresAt: null };
    const expiresAt = new Date((payload.exp as number) * 1000).toISOString();
    return { valid: true, active: (payload.exp as number) > Math.floor(Date.now() / 1000), expiresAt };
  } catch {
    return { valid: false, active: false, expiresAt: null };
  }
}
