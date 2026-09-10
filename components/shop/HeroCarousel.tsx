"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";

/* An auto-advancing image band behind the hero headline. The incoming slide
   fades in on top of the one it replaces, so a solid image is always showing —
   no background ever bleeds through the crossfade. Pauses on hover and on
   keyboard focus, carries an explicit pause/play control (WCAG 2.2.2), and
   does not auto-play for anyone who prefers reduced motion. */

export type HeroSlide = { src: string; alt: string; width: number; height: number };

const INTERVAL = 5500;

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(false);
  }, []);

  useEffect(() => {
    if (!playing || hovering || slides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => {
        setPrev(i);
        return (i + 1) % slides.length;
      });
    }, INTERVAL);
    return () => window.clearInterval(id);
  }, [playing, hovering, slides.length]);

  const go = (i: number) => {
    setPrev(index);
    setIndex(i);
  };

  if (slides.length === 0) return null;

  return (
    <div
      className="absolute inset-0 bg-surface-inverse"
      aria-roledescription="carousel"
      aria-label="Featured pieces"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocusCapture={() => setHovering(true)}
      onBlurCapture={() => setHovering(false)}
    >
      {slides.map((s, i) => {
        const isCurrent = i === index;
        const isPrev = i === prev && prev !== index;
        return (
          <Image
            key={s.src}
            src={s.src}
            alt={isCurrent ? s.alt : ""}
            fill
            sizes="100vw"
            priority={i === 0}
            aria-hidden={!isCurrent}
            style={{ zIndex: isCurrent ? 2 : isPrev ? 1 : 0 }}
            className={
              "object-cover object-[center_36%] transition-opacity duration-[1100ms] ease-out " +
              (isCurrent || isPrev ? "opacity-100" : "opacity-0")
            }
          />
        );
      })}

      {/* Faint wash so the controls stay legible over any slide. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 z-[3] h-36 bg-gradient-to-t from-black/30 to-transparent"
      />

      <div className="absolute bottom-5 right-4 z-20 flex items-center gap-3 md:bottom-7 md:right-7">
        <div className="flex items-center gap-0.5 rounded-pill bg-black/25 px-2 py-0.5 backdrop-blur">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show image ${i + 1} of ${slides.length}`}
              aria-current={i === index ? "true" : undefined}
              className="group grid h-6 w-6 place-items-center"
            >
              <span
                className={
                  "block h-1.5 rounded-pill transition-all duration-300 " +
                  (i === index ? "w-5 bg-accent" : "w-1.5 bg-white/70 group-hover:bg-white")
                }
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause the slideshow" : "Play the slideshow"}
          className="flex h-9 w-9 items-center justify-center rounded-pill bg-white/90 text-ink shadow-sm backdrop-blur transition hover:bg-white"
        >
          {playing ? <Pause size={13} aria-hidden="true" /> : <Play size={13} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}
