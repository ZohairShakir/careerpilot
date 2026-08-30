import type { Metadata } from "next";
import LegalPage from "../legal-page";
export const metadata: Metadata = { title: "Contact", description: "Contact Career Pilot for purchase, payment, or download support.", alternates: { canonical: "/contact" } };
export default function Page() { return <LegalPage title="Contact us"><p>For purchase support, payment questions, or help accessing your Career Pilot files, email <a href="mailto:arkzlab@gmail.com">arkzlab@gmail.com</a>.</p><p>Please include your Razorpay payment ID when asking about an existing purchase. We aim to respond within two business days.</p></LegalPage>; }
