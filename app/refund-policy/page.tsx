import type { Metadata } from "next";
import LegalPage from "../legal-page";
export const metadata: Metadata = { title: "Refund Policy", description: "Career Pilot's refund policy for instantly delivered digital products.", alternates: { canonical: "/refund-policy" } };
export default function Page() { return <LegalPage title="Refund policy"><p>Because this is an instantly delivered digital product, purchases are generally final once access has been provided. If you were charged incorrectly, received a duplicate charge, or cannot access the files, contact arkzlab@gmail.com with your payment ID.</p><p>This draft should be reviewed and finalized before accepting live payments.</p></LegalPage>; }
