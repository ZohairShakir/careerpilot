import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import CartCheckout from "./cart-checkout";
import { ResourceHeader } from "../site-chrome";
import { initialOfferStatus } from "../../lib/launch-offer";

export const metadata: Metadata = { title: "Your cart", description: "Review your CareerPilot bundle and continue to secure Razorpay payment.", robots: { index: false, follow: false } };

export default async function CartPage({ searchParams }: { searchParams: Promise<{ placement?: string; source?: "job_fit_offer" }> }) {
  const { placement, source } = await searchParams;
  const offer = await initialOfferStatus((await headers()).get("x-careerpilot-offer"));
  return <><ResourceHeader /><main className="cart-page"><div className="cart-shell">
    <header className="cart-heading"><p>Your order</p><Link href="/bundle">← Continue browsing</Link></header>
    <div className="cart-layout">
      <aside className="cart-payment"><p className="eyebrow">Secure checkout</p><h2>You’re one step away.</h2><p>Complete your Razorpay payment securely. Once it is verified, we’ll email your access links right away.</p><CartCheckout placement={placement} source={source} /><div className="cart-security" aria-label="Checkout assurances"><p><span aria-hidden="true">✓</span><b>Secure payment</b>Razorpay encrypts and handles your payment details.</p><p><span aria-hidden="true">✓</span><b>Instant delivery</b>Resources are emailed after successful payment verification.</p><p><span aria-hidden="true">✓</span><Link href="/refund-policy">7-day refund policy</Link>Simple support if the bundle is not right for you.</p></div></aside>
      <section className="cart-order" aria-labelledby="cart-order-title"><header><h2 id="cart-order-title">Order details</h2><span>1 item</span></header><article><Image src="/assets/careerpilot-bundle-gallery.png" alt="CareerPilot AI Job Search Bundle" width={1254} height={1254} priority /><div><span>Digital bundle</span><h3>CareerPilot AI Job Search Bundle</h3><p>A practical system for clearer roles, stronger applications, and a repeatable search routine.</p><ul><li>Instant digital access</li><li><Link href="/refund-policy">7-day refund policy</Link></li></ul></div></article><section className="cart-includes" aria-labelledby="cart-includes-title"><h3 id="cart-includes-title">What’s included</h3><ul><li>67-page AI Job Search Blueprint</li><li>Quick Start Application guide</li><li>30-Day Implementation Plan</li><li>AI-Ready Résumé Template</li><li>Job Search Checklist</li><li>Job Application Tracker</li></ul></section><div className="cart-total"><span>Today’s total</span><strong><del>₹{offer.regularPrice}</del> ₹{offer.currentPrice}</strong></div><p className="cart-delivery-note"><span aria-hidden="true">↗</span>Your digital resources will be delivered to your email after payment is successfully verified.</p></section>
    </div>
  </div></main><footer className="cart-footer"><div><span>© {new Date().getFullYear()} CareerPilot</span><nav aria-label="Checkout legal links"><Link href="/refund-policy">Refund policy</Link><Link href="/digital-delivery">Digital delivery</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></nav></div></footer></>;
}
