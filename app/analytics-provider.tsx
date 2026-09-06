"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "./analytics";

export default function AnalyticsProvider() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  useEffect(() => {
    if (!isAdmin) track("page_view", { pageTitle: document.title });
  }, [isAdmin, pathname]);
  return null;
}
