"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useOffer } from "../offer-provider";

const reviews = [
  { name: "Alex M.", photo: "/assets/testimonial-alex-v2.webp", quote: "Finally, a structured approach to job hunting. The prompts saved me hours." },
  { name: "Sarah K.", photo: "/assets/testimonial-sarah-v2.webp", quote: "The resume prompts helped me communicate better." },
  { name: "David R.", photo: "/assets/testimonial-david-v2.webp", quote: "I was applying randomly before. Now I actually have a system." },
] as const;

const videos = [
  { src: "/assets/creator-advice/creator-advice-1.mp4", poster: "/assets/creator-advice/creator-advice-1.jpg", label: "A calmer job-search routine" },
  { src: "/assets/creator-advice/creator-advice-2.mp4", poster: "/assets/creator-advice/creator-advice-2.jpg", label: "Make momentum sustainable" },
  { src: "/assets/creator-advice/creator-advice-3.mp4", poster: "/assets/creator-advice/creator-advice-3.jpg", label: "Build confidence before you apply" },
] as const;

export function BundleReviews() {
  const [activeReview, setActiveReview] = useState(0);
  const review = reviews[activeReview];
  return <section className="bundle-reviews" aria-label="CareerPilot customer reviews">
    <article className="bundle-review-card">
      <Image className="bundle-review-avatar" src={review.photo} alt="" width={86} height={86} sizes="43px" />
      <div className="bundle-review-copy"><strong>{review.name}</strong><span aria-label="5 out of 5 stars">★★★★★</span><p>“{review.quote}”</p></div>
      <span className="bundle-review-verified">Verified purchase</span>
    </article>
    <div className="bundle-review-dots" role="tablist" aria-label="Choose a review">
      {reviews.map((item, index) => <button type="button" key={item.name} role="tab" aria-label={`Show review from ${item.name}`} aria-selected={index === activeReview} className={index === activeReview ? "is-active" : ""} onClick={() => setActiveReview(index)} />)}
    </div>
  </section>;
}

export function BundleVideos() {
  const { offer } = useOffer();
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<"up" | "down">("up");
  const viewerVideoRef = useRef<HTMLVideoElement>(null);
  const lastNavigationRef = useRef(0);
  const moveViewer = (direction: number) => {
    if (Date.now() - lastNavigationRef.current < 380) return;
    lastNavigationRef.current = Date.now();
    setSwipeDirection(direction > 0 ? "up" : "down");
    setViewerIndex((current) => current === null ? null : (current + direction + videos.length) % videos.length);
  };

  useEffect(() => {
    if (viewerIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.code === "Space") { event.preventDefault(); return; }
      if (event.key === "ArrowDown") { event.preventDefault(); moveViewer(1); }
      if (event.key === "ArrowUp") { event.preventDefault(); moveViewer(-1); }
      if (event.key === "Escape") setViewerIndex(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [viewerIndex]);

  useEffect(() => {
    if (viewerIndex === null || !viewerVideoRef.current) return;
    viewerVideoRef.current.muted = isMuted;
    void viewerVideoRef.current.play().catch(() => {});
  }, [viewerIndex, isMuted]);

  return <section className="bundle-video-section" aria-label="CareerPilot videos">
    <div className="bundle-video-rail">
        {videos.map((video, index) => <button type="button" className="bundle-video-card" key={video.src} aria-label={`Open ${video.label} in reel viewer`} onClick={() => setViewerIndex(index)}>
          <video muted playsInline preload="metadata" poster={video.poster} aria-label={video.label}>
            <source src={video.src} type="video/mp4" />
          </video>
          <span className="bundle-video-play" aria-hidden="true">▶</span>
        </button>)}
    </div>
    {viewerIndex !== null ? <div className="reel-viewer" role="dialog" aria-modal="true" aria-label="CareerPilot video viewer" onTouchStart={(event) => setTouchStart(event.touches[0]?.clientY ?? null)} onTouchEnd={(event) => { const end = event.changedTouches[0]?.clientY; if (touchStart !== null && end !== undefined && Math.abs(touchStart - end) > 45) moveViewer(touchStart > end ? 1 : -1); setTouchStart(null); }} onWheel={(event) => { if (Math.abs(event.deltaY) > 18) moveViewer(event.deltaY > 0 ? 1 : -1); }}>
      <div className="reel-viewer-frame"><div className={`reel-viewer-media reel-swipe-${swipeDirection}`} key={videos[viewerIndex].src}><video ref={viewerVideoRef} autoPlay muted={isMuted} loop playsInline preload="auto" poster={videos[viewerIndex].poster} className="reel-viewer-video" aria-label={videos[viewerIndex].label}><source src={videos[viewerIndex].src} type="video/mp4" /></video></div>
        <div className="reel-viewer-top"><span>{viewerIndex + 1} / {videos.length}</span><div><button type="button" className="reel-viewer-sound" aria-label={isMuted ? "Turn sound on" : "Mute video"} aria-pressed={!isMuted} onClick={() => setIsMuted((muted) => !muted)}><VolumeIcon muted={isMuted} /></button><button type="button" className="reel-viewer-close" aria-label="Close video viewer" onClick={() => setViewerIndex(null)}>×</button></div></div>
        <div className="reel-viewer-meta"><p>{videos[viewerIndex].label}</p><small>Swipe up or down for the next reel</small><Link className="reel-product-cta" href="/cart" onClick={() => setViewerIndex(null)}><Image src="/assets/careerpilot-bundle-gallery.png" alt="CareerPilot Bundle" width={92} height={92} /><span><b>CareerPilot Bundle</b><em><del>₹{offer.regularPrice}</del> ₹{offer.currentPrice}</em></span><strong>Get the bundle</strong></Link></div>
      </div>
    </div> : null}
  </section>;
}

function VolumeIcon({ muted }: { muted: boolean }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h4l4-3.5v12L8 14.5H4z" />{muted ? <><path d="m16 9 4 6" /><path d="m20 9-4 6" /></> : <><path d="M16 9.5c1.1 1.3 1.1 3.7 0 5" /><path d="M19 7c2.6 2.9 2.6 7.1 0 10" /></>}</svg>;
}
