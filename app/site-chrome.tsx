"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useOffer } from "./offer-provider";

export function Brand() {
  return <Link className="wordmark" href="/"><span className="mark" aria-hidden="true">✦</span>career pilot</Link>;
}

export function ResourceHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<"learn" | "shop" | null>(null);
  const [drawer, setDrawer] = useState<"search" | "cart" | null>(null);
  const [query, setQuery] = useState("");
  const { offer } = useOffer();
  const closeMenu = () => setMenuOpen(false);
  const closeDrawer = () => setDrawer(null);
  const searchItems = [
    { title: "CareerPilot Bundle", description: "Six connected job-search resources", href: "/bundle" },
    { title: "Career planners", description: "Five focused printable planners", href: "/planners" },
    { title: "Resume Match Checker", description: "Compare your resume with a role", href: "/job-fit-check" },
    { title: "Job-search guides", description: "Practical career guidance", href: "/blog" },
    { title: "Free AI prompts", description: "Start with ten useful prompts", href: "/free-ai-job-search-prompts" },
  ].filter((item) => item.title.toLowerCase().includes(query.toLowerCase()) || item.description.toLowerCase().includes(query.toLowerCase()));
  return (
    <>
      <div className="announcement-bar"><span aria-hidden="true">✦</span> Launch price: CareerPilot AI Job Search Bundle — ₹{offer.currentPrice}</div>
      <header className="nav shell resource-nav">
        <Brand />
        <nav className="site-nav-links" aria-label="Primary navigation">
          <Link href="/">Home</Link>
          <div className={`nav-explore ${openMenu === "shop" ? "is-open" : ""}`} onMouseEnter={() => setOpenMenu("shop")} onMouseLeave={() => setOpenMenu(null)}><button type="button" aria-expanded={openMenu === "shop"} onClick={() => setOpenMenu((menu) => menu === "shop" ? null : "shop")}>Shop <ChevronIcon /></button><div className="nav-dropdown nav-mega-menu"><Link className="nav-mega-feature" href="/bundle" onClick={() => setOpenMenu(null)}><Image src="/assets/careerpilot-bundle-gallery.png" alt="" width={550} height={550} /><span><b>The CareerPilot Bundle</b><small>Six connected resources for a clearer job search.</small><em>Explore the bundle ↗</em></span></Link><div className="nav-mega-list"><p>Digital planners</p><Link href="/planners" onClick={() => setOpenMenu(null)}><b>Planner series</b><small>All five focused planners</small></Link><Link href="/planners/daily-job-search-planner" onClick={() => setOpenMenu(null)}><b>Daily Job Search</b><small>Build a useful daily rhythm</small></Link><Link href="/planners/interview-preparation-planner" onClick={() => setOpenMenu(null)}><b>Interview Preparation</b><small>Prepare with more confidence</small></Link></div></div></div>
          <div className={`nav-explore ${openMenu === "learn" ? "is-open" : ""}`} onMouseEnter={() => setOpenMenu("learn")} onMouseLeave={() => setOpenMenu(null)}><button type="button" aria-expanded={openMenu === "learn"} onClick={() => setOpenMenu((menu) => menu === "learn" ? null : "learn")}>Learn <ChevronIcon /></button><div className="nav-dropdown nav-learning-menu"><Link href="/job-fit-check" onClick={() => setOpenMenu(null)}><b>Resume Match</b><small>See how your resume fits a role</small></Link><Link href="/blog" onClick={() => setOpenMenu(null)}><b>Guides</b><small>Practical job-search advice</small></Link><Link href="/free-ai-job-search-prompts" onClick={() => setOpenMenu(null)}><b>Free prompts</b><small>Start building momentum</small></Link></div></div>
          <Link href="/about">About</Link>
        </nav>
        <div className="nav-actions"><button type="button" className="nav-icon-button" aria-label="Search CareerPilot" onClick={() => setDrawer("search")}><SearchIcon /></button><button type="button" className="nav-icon-button" aria-label="Open cart" onClick={() => setDrawer("cart")}><BagIcon /></button></div>
        <button className="nav-mobile-toggle" type="button" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} aria-controls="site-mobile-menu" onClick={() => setMenuOpen((open) => !open)}><span /><span /><span /></button>
        {menuOpen ? <div className="nav-mobile-panel" id="site-mobile-menu"><nav aria-label="Mobile navigation"><Link href="/" onClick={closeMenu}>Home</Link><Link href="/bundle" onClick={closeMenu}>The bundle</Link><Link href="/planners" onClick={closeMenu}>Planners</Link><Link href="/job-fit-check" onClick={closeMenu}>Resume Match</Link><Link href="/blog" onClick={closeMenu}>Guides</Link><Link href="/free-ai-job-search-prompts" onClick={closeMenu}>Free prompts</Link><Link href="/about" onClick={closeMenu}>About</Link><Link className="buy-button" href="/bundle" onClick={closeMenu}>Get the bundle</Link></nav></div> : null}
      </header>
      {drawer ? <div className="site-drawer-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeDrawer()}><aside className="site-drawer" role="dialog" aria-modal="true" aria-label={drawer === "search" ? "Search CareerPilot" : "Your cart"}><header><h2>{drawer === "search" ? "Search CareerPilot" : "Your cart"}</h2><button type="button" aria-label="Close" onClick={closeDrawer}>×</button></header>{drawer === "search" ? <div className="search-drawer"><label><SearchIcon /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search resources" /></label><p>Popular</p><div>{searchItems.map((item) => <Link key={item.href} href={item.href} onClick={closeDrawer}><b>{item.title}</b><span>{item.description}</span></Link>)}</div></div> : <div className="nav-cart-drawer"><article><Image src="/assets/careerpilot-bundle-gallery.png" alt="CareerPilot AI Job Search Bundle" width={1254} height={1254} /><div><h3>CareerPilot AI Job Search Bundle</h3><p>6 digital resources</p><b><del>₹{offer.regularPrice}</del> ₹{offer.currentPrice}</b></div></article><div className="nav-cart-total"><span>Subtotal</span><strong>₹{offer.currentPrice}</strong></div><Link className="buy-button" href="/cart" onClick={closeDrawer}>View cart</Link><p>Secure Razorpay payment · Instant email delivery</p></div>}</aside></div> : null}
    </>
  );
}

function SearchIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.5" /><path d="m16 16 4.1 4.1" /></svg>; }
function BagIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 8.5h13l-1 11h-11z" /><path d="M9 9V6.7a3 3 0 0 1 6 0V9" /></svg>; }
function ChevronIcon() { return <svg className="nav-chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="m3 5.5 5 5 5-5" /></svg>; }

export function ResourceFooter() {
  return (
    <footer className="site-footer"><div className="footer shell">
        <div className="footer-brand"><Brand /><p>Clearer roles. Stronger applications. A more focused you.</p><small>© {new Date().getFullYear()} Career Pilot</small></div>
        <div className="footer-links">
          <section><h2>Explore</h2><Link href="/bundle">The bundle</Link><Link href="/planners">Planner series</Link><Link href="/job-fit-check">Resume Match</Link><Link href="/blog">Guides</Link></section>
          <section><h2>Products</h2><Link href="/bundle">AI Job Search Bundle</Link><Link href="/planners">All planners</Link><Link href="/digital-delivery">Digital delivery</Link><Link href="/refund-policy">7-day refund policy</Link></section>
          <section><h2>Company</h2><Link href="/about">About CareerPilot</Link><Link href="/contact">Contact</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms of use</Link></section>
        </div>
    </div></footer>
  );
}
