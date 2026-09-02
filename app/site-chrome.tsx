import Link from "next/link";

export function Brand() {
  return <Link className="wordmark" href="/"><span className="mark" aria-hidden="true">✦</span>career pilot</Link>;
}

export function ResourceHeader() {
  return (
    <header className="nav shell resource-nav">
      <Brand />
      <nav aria-label="Primary navigation">
        <Link href="/blog">Guides</Link>
        <Link href="/free-ai-job-search-prompts">Free prompts</Link>
        <Link href="/about">About</Link>
      </nav>
      <Link className="buy-button compact" href="/#buy">Get the bundle</Link>
    </header>
  );
}

export function ResourceFooter() {
  return (
    <footer className="footer shell">
      <Brand />
      <div>
        <Link href="/blog">Guides</Link><Link href="/about">About</Link>
        <Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/contact">Contact</Link>
      </div>
    </footer>
  );
}
