import Link from "next/link";
import { supabaseRequest } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

type Funnel = { visitors: number; cta_clicks: number; checkout_opens: number; checkout_starts: number; purchases: number; conversion_rate: number | null };
type Checkout = { email: string; status: string; razorpay_order_id: string; utm_source: string | null; utm_campaign: string | null; created_at: string };
type Purchase = { email: string | null; razorpay_payment_id: string; amount: number; download_count: number; purchased_at: string };

function date(value: string) { return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(value)); }

export default async function AnalyticsDashboard() {
  const [funnels, abandoned, purchases] = await Promise.all([
    supabaseRequest<Funnel[]>("funnel_summary?select=*&limit=1"),
    supabaseRequest<Checkout[]>("abandoned_checkouts?select=email,status,razorpay_order_id,utm_source,utm_campaign,created_at&order=created_at.desc&limit=25"),
    supabaseRequest<Purchase[]>("purchases?select=email,razorpay_payment_id,amount,download_count,purchased_at&order=purchased_at.desc&limit=25"),
  ]);
  const funnel = funnels?.[0] || { visitors: 0, cta_clicks: 0, checkout_opens: 0, checkout_starts: 0, purchases: 0, conversion_rate: 0 };
  return <main className="dashboard">
    <header className="dashboard-header"><div><span className="wordmark"><span className="mark">✦</span>career pilot</span><h1>Purchase analytics</h1></div><Link href="/">View website ↗</Link></header>
    <section className="metrics">
      {[['Visitors',funnel.visitors],['CTA clicks',funnel.cta_clicks],['Checkout starts',funnel.checkout_starts],['Purchases',funnel.purchases],['Conversion',`${funnel.conversion_rate || 0}%`]].map(([label,value]) => <div className="metric" key={label}><span>{label}</span><strong>{value}</strong></div>)}
    </section>
    <section className="dashboard-section"><h2>Abandoned checkouts</h2><div className="dashboard-table-wrap"><table className="data-table"><thead><tr><th>Email</th><th>Status</th><th>Source</th><th>Campaign</th><th>Started</th><th>Order</th></tr></thead><tbody>{abandoned?.length ? abandoned.map(item => <tr key={item.razorpay_order_id}><td>{item.email}</td><td>{item.status}</td><td>{item.utm_source || 'Direct'}</td><td>{item.utm_campaign || '—'}</td><td>{date(item.created_at)}</td><td>{item.razorpay_order_id}</td></tr>) : <tr><td className="empty-row" colSpan={6}>No abandoned checkouts yet.</td></tr>}</tbody></table></div></section>
    <section className="dashboard-section"><h2>Recent purchases</h2><div className="dashboard-table-wrap"><table className="data-table"><thead><tr><th>Email</th><th>Amount</th><th>Downloads</th><th>Purchased</th><th>Payment</th></tr></thead><tbody>{purchases?.length ? purchases.map(item => <tr key={item.razorpay_payment_id}><td>{item.email || '—'}</td><td>₹{(item.amount / 100).toFixed(0)}</td><td>{item.download_count}</td><td>{date(item.purchased_at)}</td><td>{item.razorpay_payment_id}</td></tr>) : <tr><td className="empty-row" colSpan={5}>No purchases yet.</td></tr>}</tbody></table></div></section>
  </main>;
}
