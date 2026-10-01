import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { createDownloadToken, products } from "../../lib/downloads";
import { readPurchaseReceipt, RECEIPT_COOKIE } from "../../lib/purchase-receipt";
import PurchaseSuccess from "./purchase-success";

export const metadata: Metadata = { title: "Thank you", robots: { index: false, follow: false }, alternates: { canonical: "/thank-you" } };

export default async function ThankYouPage() {
  const receipt = readPurchaseReceipt((await cookies()).get(RECEIPT_COOKIE)?.value);
  if (!receipt) return <main className="shell thank-you-page"><h1>Your purchase downloads</h1><p>A recent verified purchase is required to access this page. If your download links expired, contact <a href="mailto:arkzlab@gmail.com">arkzlab@gmail.com</a> with your Razorpay payment ID.</p><Link className="text-link" href="/">Return to Career Pilot →</Link></main>;
  const downloads = Object.entries(products).map(([key, product]) => ({ label: product.downloadName, url: `/api/download?token=${encodeURIComponent(createDownloadToken(receipt.paymentId, key as keyof typeof products, receipt.expiresAt))}` }));
  return <main className="shell thank-you-page"><PurchaseSuccess paymentId={receipt.paymentId} orderId={receipt.orderId} value={receipt.amount / 100} downloads={downloads} /><Link className="text-link" href="/">Return to Career Pilot →</Link></main>;
}
