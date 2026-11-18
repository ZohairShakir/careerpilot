"use client";

import Image from "next/image";
import { useState } from "react";

const gallery = [
  {
    src: "/assets/careerpilot-bundle-gallery.png",
    alt: "The complete CareerPilot seven-in-one job-search bundle",
    width: 1254,
    height: 1254,
    label: "Complete bundle",
  },
  {
    src: "/assets/careerpilot-blueprint-gallery.png",
    alt: "The AI Job Search Blueprint book cover",
    width: 1254,
    height: 1254,
    label: "Blueprint",
  },
  {
    src: "/assets/careerpilot-blueprint-reasons-gallery.webp",
    alt: "Five reasons to use The AI Job Search Blueprint",
    width: 1254,
    height: 1254,
    label: "Five reasons",
  },
  {
    src: "/assets/careerpilot-blueprint-reviews-gallery.webp",
    alt: "Reviews for The AI Job Search Blueprint",
    width: 1254,
    height: 1254,
    label: "Reviews",
  },
] as const;

export default function BundleGallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = gallery[activeIndex];

  return <section className="bundle-gallery" aria-label="CareerPilot bundle previews">
    <div className="bundle-gallery-main">
      <Image key={active.src} src={active.src} alt={active.alt} width={active.width} height={active.height} sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 1100px) 48vw, 650px" priority={activeIndex === 0} />
    </div>
    <div className="bundle-gallery-thumbnails" role="list" aria-label="Choose a bundle preview">
      {gallery.map((item, index) => <button type="button" role="listitem" className={index === activeIndex ? "is-active" : ""} key={item.src} onClick={() => setActiveIndex(index)} aria-label={`Show ${item.label}`} aria-pressed={index === activeIndex}>
        <Image src={item.src} alt="" width={item.width} height={item.height} sizes="92px" />
      </button>)}
    </div>
  </section>;
}
