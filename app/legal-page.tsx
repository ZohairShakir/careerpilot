import Link from "next/link";

export default function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return <main className="legal"><Link href="/" className="wordmark"><span className="mark">✦</span>career pilot</Link><h1>{title}</h1><div>{children}</div><Link href="/">← Back to home</Link></main>;
}
