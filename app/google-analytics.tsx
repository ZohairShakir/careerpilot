import Script from "next/script";

export default function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!id) return null;
  return <>
    <Script id="ga4" strategy="beforeInteractive">{`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', '${id}', { anonymize_ip: true, send_page_view: false });
    `}</Script>
    <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
  </>;
}
