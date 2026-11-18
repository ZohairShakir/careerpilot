import Link from "next/link";
import { ResourceFooter, ResourceHeader } from "./site-chrome";

export default function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return <><ResourceHeader /><main className="legal"><h1>{title}</h1><div>{children}</div><Link href="/">← Back to home</Link></main><ResourceFooter /></>;
}
