"use client";

import { useEffect, useRef, useState } from "react";

export default function CreatorVideo({ src, poster, label }: { src: string; poster: string; label: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setNearViewport(true);
      observer.disconnect();
    }, { rootMargin: "300px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <video ref={video} controls playsInline preload="none" poster={nearViewport ? poster : undefined} aria-label={label}>
    {nearViewport ? <source src={src} type="video/mp4" /> : null}
  </video>;
}
