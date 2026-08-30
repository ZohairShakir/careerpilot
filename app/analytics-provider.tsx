"use client";

import { useEffect } from "react";
import { track } from "./analytics";

export default function AnalyticsProvider() {
  useEffect(() => { track("page_view"); }, []);
  return null;
}
