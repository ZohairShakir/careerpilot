import crypto from "node:crypto";

export const products = {
  blueprint: { filename: "THE AI JOB SEARCH BLUEPRINT.pdf", downloadName: "Career-Pilot-AI-Job-Search-Blueprint.pdf" },
  resume: { filename: "AI-Ready Resume Template.pdf", downloadName: "Career-Pilot-AI-Ready-Resume-Template.pdf" },
  checklist: { filename: "ai job search checklist.pdf", downloadName: "Career-Pilot-Job-Search-Checklist.pdf" },
} as const;

export type ProductId = keyof typeof products;

function secret() {
  const value = process.env.DOWNLOAD_SIGNING_SECRET;
  if (!value) throw new Error("Download signing is not configured");
  return value;
}

export function createDownloadToken(paymentId: string, product: ProductId, expiresAt: number) {
  const payload = Buffer.from(JSON.stringify({ paymentId, product, expiresAt })).toString("base64url");
  const signature = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function readDownloadToken(token: string) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
    paymentId: string;
    product: ProductId;
    expiresAt: number;
  };
  if (!products[data.product] || Date.now() > data.expiresAt) return null;
  return data;
}
