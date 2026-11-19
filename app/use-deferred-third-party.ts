"use client";

import { useEffect, useState } from "react";

// Keep advertising and session-recording scripts out of the critical mobile
// render path. First-party conversion events are still collected immediately.
export function useDeferredThirdParty() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const enable = () => setReady(true);
    const timer = window.setTimeout(enable, 4000);
    const options = { once: true, passive: true };
    window.addEventListener("pointerdown", enable, options);
    window.addEventListener("touchstart", enable, options);
    window.addEventListener("keydown", enable, options);
    window.addEventListener("scroll", enable, options);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", enable);
      window.removeEventListener("touchstart", enable);
      window.removeEventListener("keydown", enable);
      window.removeEventListener("scroll", enable);
    };
  }, []);

  return ready;
}
