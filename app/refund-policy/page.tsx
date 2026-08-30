import type { Metadata } from "next";
import LegalPage from "../legal-page";
export const metadata: Metadata = { title: "Refund Policy", description: "Career Pilot's refund policy for instantly delivered digital products.", alternates: { canonical: "/refund-policy" } };
export default function Page() { return <LegalPage title="Refund policy"><p>Because the Career Pilot bundle is an instantly delivered digital product, purchases are generally final once access has been provided.</p><p>If you were charged incorrectly, received a duplicate charge, or cannot access the files, contact arkzlab@gmail.com with your Razorpay payment ID. Eligible billing or delivery issues will be reviewed individually.</p></LegalPage>; }
