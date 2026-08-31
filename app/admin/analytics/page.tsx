import Link from "next/link";
import { supabaseCount, supabaseRequest } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

type Checkout = { email: string; status: string; razorpay_order_id: string; utm_source: string | null; utm_campaign: string | null; created_at: string };
type Purchase = { email: string | null; razorpay_payment_id: string; amount: number; download_count: number; purchased_at: string };
type Query = { range?: string | string[]; from?: string | string[]; to?: string | string[] };
type Bounds = { key: "today" | "yesterday" | "custom" | "all"; start?: string; end?: string; label: string; from: string; to: string };

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function first(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }
function istDate(offset = 0) {
  const value = new Date(Date.now() + 330 * 60 * 1000);
  value.setUTCDate(value.getUTCDate() + offset);
  return value.toISOString().slice(0, 10);
}
function atIstMidnight(value: string) { return new Date(`${value}T00:00:00+05:30`).toISOString(); }
function nextDay(value: string) {
  const date = new Date(`${value}T00:00:00+05:30`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString();
}
function bounds(query: Query): Bounds {
  const today = istDate();
  const selected = first(query.range);
  const from = first(query.from) || today;
  const to = first(query.to) || today;
  if (selected === "all") return { key: "all", label: "All time", from, to };
  if (selected === "yesterday") {
    const yesterday = istDate(-1);
    return { key: "yesterday", start: atIstMidnight(yesterday), end: atIstMidnight(today), label: "Yesterday", from, to };
  }
  if (selected === "custom" && DATE.test(from) && DATE.test(to) && from <= to) {
    return { key: "custom", start: atIstMidnight(from), end: nextDay(to), label: `${from} to ${to}`, from, to };
  }
  return { key: "today", start: atIstMidnight(today), end: nextDay(today), label: "Today", from, to };
}
function filter(column: string, period: Bounds) {
  if (!period.start || !period.end) return "";
  return `&${column}=gte.${encodeURIComponent(period.start)}&${column}=lt.${encodeURIComponent(period.end)}`;
}
function date(value: string) { return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(value)); }

export default async function AnalyticsDashboard({ searchParams }: { searchParams: Promise<Query> }) {
  const period = bounds(await searchParams);
  const eventFilter = filter("created_at", period);
  const checkoutFilter = filter("created_at", period);
  const purchaseFilter = filter("purchased_at", period);
  const visitorFilter = filter("first_seen_at", period);

  const [visitors, ctaClicks, checkoutStarts, purchaseCount, abandoned, purchases] = await Promise.all([
    supabaseCount(`visitor_sessions?select=session_id${visitorFilter}`),
    supabaseCount(`analytics_events?select=id&event_name=eq.bundle_cta_clicked${eventFilter}`),
    supabaseCount(`analytics_events?select=id&event_name=eq.checkout_details_submitted${eventFilter}`),
    supabaseCount(`purchases?select=id${purchaseFilter}`),
    supabaseRequest<Checkout[]>(`abandoned_checkouts?select=email,status,razorpay_order_id,utm_source,utm_campaign,created_at${checkoutFilter}&order=created_at.desc&limit=25`),
    supabaseRequest<Purchase[]>(`purchases?select=email,razorpay_payment_id,amount,download_count,purchased_at${purchaseFilter}&order=purchased_at.desc&limit=25`),
  ]);
  const conversion = visitors ? Math.round((purchaseCount / visitors) * 10000) / 100 : 0;

  return <main className="dashboard">
    <header className="dashboard-header"><div><span className="wordmark"><span className="mark">✦</span>career pilot</span><h1>Purchase analytics</h1></div><Link href="/">View website ↗</Link></header>
    <section className="dashboard-filters" aria-label="Analytics date range">
      <div className="quick-filters">
        {[["today", "Today"], ["yesterday", "Yesterday"], ["all", "All time"]].map(([key, label]) => <Link key={key} className={period.key === key ? "active" : ""} href={`?range=${key}`}>{label}</Link>)}
      </div>
      <form className="custom-filter" method="get">
        <input type="hidden" name="range" value="custom" />
        <label>From<input type="date" name="from" defaultValue={period.from} required /></label>
        <label>To<input type="date" name="to" defaultValue={period.to} required /></label>
        <button type="submit">Apply</button>
      </form>
      <p>Showing: <strong>{period.label}</strong> · India Standard Time</p>
    </section>
    <section className="metrics">
      {[["Visitors", visitors], ["CTA clicks", ctaClicks], ["Checkout starts", checkoutStarts], ["Purchases", purchaseCount], ["Conversion", `${conversion}%`]].map(([label, value]) => <div className="metric" key={label}><span>{label}</span><strong>{value}</strong></div>)}
    </section>
    <section className="dashboard-section"><h2>Abandoned checkouts</h2><div className="dashboard-table-wrap"><table className="data-table"><thead><tr><th>Email</th><th>Status</th><th>Source</th><th>Campaign</th><th>Started</th><th>Order</th></tr></thead><tbody>{abandoned?.length ? abandoned.map(item => <tr key={item.razorpay_order_id}><td>{item.email}</td><td>{item.status}</td><td>{item.utm_source || "Direct"}</td><td>{item.utm_campaign || "—"}</td><td>{date(item.created_at)}</td><td>{item.razorpay_order_id}</td></tr>) : <tr><td className="empty-row" colSpan={6}>No abandoned checkouts for this period.</td></tr>}</tbody></table></div></section>
    <section className="dashboard-section"><h2>Purchases</h2><div className="dashboard-table-wrap"><table className="data-table"><thead><tr><th>Email</th><th>Amount</th><th>Downloads</th><th>Purchased</th><th>Payment</th></tr></thead><tbody>{purchases?.length ? purchases.map(item => <tr key={item.razorpay_payment_id}><td>{item.email || "—"}</td><td>₹{(item.amount / 100).toFixed(0)}</td><td>{item.download_count}</td><td>{date(item.purchased_at)}</td><td>{item.razorpay_payment_id}</td></tr>) : <tr><td className="empty-row" colSpan={5}>No purchases for this period.</td></tr>}</tbody></table></div></section>
  </main>;
}
