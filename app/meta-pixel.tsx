"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

type Pixel = ((...args: unknown[]) => void) & { queue: unknown[][]; callMethod?: (...args: unknown[]) => void; push?: Pixel; loaded?: boolean; version?: string };
declare global { interface Window { fbq?: Pixel; _fbq?: Pixel } }

export const META_PIXEL_ID = "944358658740047";

// Queue events immediately, including those fired before the network script loads.
export function pixel(event: string, value?: number, eventId?: string) {
  if (typeof window === "undefined" || location.pathname.startsWith("/admin")) return;
  if (!window.fbq) {
    const fbq: Pixel = Object.assign(function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    }, { queue: [] as unknown[][] });
    fbq.push = fbq; fbq.loaded = true; fbq.version = "2.0";
    window.fbq = fbq; window._fbq = fbq;
    fbq("init", META_PIXEL_ID);
  }
  const data = value === undefined ? {} : {
    content_ids: ["career-pilot-bundle"], content_type: "product",
    content_name: "Career Pilot AI Job Search Bundle", value, currency: "INR", num_items: 1,
  };
  window.fbq("track", event, data, ...(eventId ? [{ eventID: eventId }] : []));
}

export default function MetaPixel() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <Script id="meta-pixel" src="https://connect.facebook.net/en_US/fbevents.js" strategy="afterInteractive" />;
}
