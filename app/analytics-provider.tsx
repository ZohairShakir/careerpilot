"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "./analytics";

export default function AnalyticsProvider() {
  const pathname = usePathname();
  useEffect(() => { track("page_view", { pageTitle: document.title }); }, [pathname]);
  return null;
}
