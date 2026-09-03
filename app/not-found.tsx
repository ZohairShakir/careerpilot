import Link from "next/link";
import { ResourceFooter, ResourceHeader } from "./site-chrome";

export default function NotFound() {
  return <><ResourceHeader /><main className="not-found shell"><span>404</span><h1>This route went<br /><em>off course.</em></h1><p>The page may have moved, but your next useful step is close by.</p><div><Link className="buy-button" href="/">Return home</Link><Link className="text-link" href="/blog">Explore job-search guides →</Link></div></main><ResourceFooter /></>;
}
