"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import NextImage from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { Media } from "@/components/ui/Media";

type GalleryImage = { url: string; alt: string; kind: string; width: number; height: number };

const KIND_LABEL: Record<string, string> = {
  hero: "Full view",
  macro: "Texture close-up",
  lifestyle: "In use",
  scale: "Shown for scale",
};

/* The first image is always rendered by the server as the LCP element. Only
   the *switching* is client-side, so a customer on a slow connection sees the
   product before any JavaScript arrives.

   Stepping wraps around at both ends. A gallery that dead-ends on the last
   image makes people think it is broken; wrapping costs nothing and the
   position counter keeps them oriented. */

export function Gallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [active, setActive] = useState(0);
  const [fullScreen, setFullScreen] = useState(false);

  const count = images.length;
  const step = useCallback(
    (delta: number) => setActive((i) => (i + delta + count) % count),
    [count],
  );
  const closeFullScreen = useCallback(() => setFullScreen(false), []);

  if (count === 0) return <div className="media-portrait rounded-lg bg-surface-sunken" />;

  const index = Math.min(active, count - 1);
  const current = images[index];

  return (
    // min-w-0 because this is a grid item on the product page, and a grid item
    // defaults to min-width:auto - which means it refuses to shrink below the
    // thumbnail row's width (five 80px thumbs plus gaps is 448px) and pushes
    // the whole page sideways on a phone. With this, the row scrolls instead.
    <div className="flex min-w-0 flex-col gap-4 lg:flex-row-reverse lg:gap-6">
      <figure className="group relative min-w-0 flex-1">
        <button
          type="button"
          onClick={() => setFullScreen(true)}
          aria-label={`Open ${title} full screen`}
          className="block w-full cursor-zoom-in rounded-lg"
        >
          <Media
            src={current.url}
            alt={current.alt}
            width={current.width}
            height={current.height}
            sizes="(min-width: 1024px) 46vw, 100vw"
            priority={index === 0}
            aspect={current.kind === "macro" ? "square" : "portrait"}
            className="rounded-lg border border-border"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-pill bg-white/90 text-ink shadow-sm backdrop-blur transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100"
          >
            <Expand size={16} />
          </span>
        </button>

        {count > 1 ? (
          <>
            <Arrow side="left" label="Previous image" onClick={() => step(-1)} />
            <Arrow side="right" label="Next image" onClick={() => step(1)} />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-3 left-3 rounded-pill bg-white/90 px-2.5 py-1 text-2xs font-medium tabular-nums text-ink shadow-sm backdrop-blur"
            >
              {index + 1} / {count}
            </span>
          </>
        ) : null}

        {KIND_LABEL[current.kind] ? (
          <figcaption className="mt-3 text-xs uppercase tracking-widest text-ink-muted">
            {KIND_LABEL[current.kind]}
          </figcaption>
        ) : null}
      </figure>

      {count > 1 ? (
        <div
          role="tablist"
          aria-label={`${title} images`}
          aria-orientation="horizontal"
          onKeyDown={(event) => {
            // role="tablist" promises arrow-key navigation; honour it.
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
            event.preventDefault();
            step(event.key === "ArrowRight" ? 1 : -1);
          }}
          className="flex gap-3 overflow-x-auto lg:flex-col lg:overflow-visible"
        >
          {images.map((image, i) => {
            const selected = i === index;
            return (
              <button
                key={image.url}
                role="tab"
                type="button"
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                aria-label={`${KIND_LABEL[image.kind] ?? "View"} ${i + 1} of ${count}`}
                onClick={() => setActive(i)}
                className={
                  "h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-colors lg:h-24 lg:w-24 " +
                  (selected ? "border-surface-brand" : "border-border hover:border-border-control")
                }
              >
                <Media src={image.url} alt="" width={200} height={200} sizes="96px" aspect="square" />
              </button>
            );
          })}
        </div>
      ) : null}

      {fullScreen ? (
        <FullScreenViewer
          images={images}
          index={index}
          title={title}
          onSelect={setActive}
          onStep={step}
          onClose={closeFullScreen}
        />
      ) : null}
    </div>
  );
}

function Arrow({
  side, label, onClick,
}: {
  side: "left" | "right";
  label: string;
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={
        "absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-pill " +
        "bg-white/90 text-ink shadow-sm backdrop-blur transition-[opacity,background-color] duration-200 " +
        "hover:bg-white md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 " +
        (side === "left" ? "left-3" : "right-3")
      }
    >
      <Icon size={20} aria-hidden="true" />
    </button>
  );
}

/* Rendered through a portal so no ancestor's overflow, stacking context or
   transform can clip it. Everything a modal owes the keyboard is here: focus
   moves in on open and back out on close, Tab cannot escape, Escape closes,
   and the arrow keys step through. */
function FullScreenViewer({
  images, index, title, onSelect, onStep, onClose,
}: {
  images: GalleryImage[];
  index: number;
  title: string;
  onSelect: (index: number) => void;
  onStep: (delta: number) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);
  const [mounted, setMounted] = useState(false);

  // The handlers are fresh closures on every parent render. Reading them from a
  // ref keeps the effect below a true mount/unmount effect: without this it
  // tears down and re-runs on each step, snatching focus back to the close
  // button every time someone presses an arrow.
  const handlers = useRef({ onClose, onStep });
  // Assigned in an effect, not during render: a ref written while rendering is
  // not safe under concurrent rendering, where a render can be thrown away.
  useEffect(() => {
    handlers.current = { onClose, onStep };
  });

  useEffect(() => setMounted(true), []);

  // Waits for `mounted`, because until the portal has rendered there is no
  // close button to move focus to.
  useEffect(() => {
    if (!mounted) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        handlers.current.onClose();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlers.current.onStep(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        handlers.current.onStep(1);
      } else if (event.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = bodyOverflow;
      previouslyFocused?.focus();
    };
  }, [mounted]);

  if (!mounted) return null;

  const current = images[index];
  const count = images.length;

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${title}, image ${index + 1} of ${count}`}
      className="fixed inset-0 z-[100] flex flex-col bg-[rgb(9_9_11/0.95)]"
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <p className="text-2xs uppercase tracking-widest text-white/70">
          {index + 1} / {count}
          {KIND_LABEL[current.kind] ? ` — ${KIND_LABEL[current.kind]}` : ""}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close full screen"
          className="flex h-11 w-11 items-center justify-center rounded-pill bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      {/* Clicking the surround closes. The image is pointer-transparent so a
          click on it counts as a click on the surround, which is what people
          expect from a viewer opened by clicking an image. */}
      <div
        className="relative min-h-0 flex-1 cursor-zoom-out"
        onClick={onClose}
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0].clientX;
        }}
        onTouchEnd={(event) => {
          const start = touchStartX.current;
          touchStartX.current = null;
          if (start === null || count < 2) return;
          const delta = event.changedTouches[0].clientX - start;
          if (Math.abs(delta) > 50) onStep(delta < 0 ? 1 : -1);
        }}
      >
        <NextImage
          key={current.url}
          src={current.url}
          alt={current.alt}
          fill
          sizes="100vw"
          priority
          className="pointer-events-none object-contain p-3 sm:p-8"
        />

        {count > 1 ? (
          <>
            <ViewerArrow side="left" label="Previous image" onClick={() => onStep(-1)} />
            <ViewerArrow side="right" label="Next image" onClick={() => onStep(1)} />
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <div className="flex justify-center gap-2 overflow-x-auto px-4 py-4">
          {images.map((image, i) => (
            <button
              key={image.url}
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`Show image ${i + 1} of ${count}`}
              aria-current={i === index}
              className={
                "h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 transition-colors " +
                (i === index ? "border-surface-brand" : "border-white/25 hover:border-white/60")
              }
            >
              <NextImage
                src={image.url}
                alt=""
                width={112}
                height={112}
                sizes="56px"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>,
    document.body,
  );
}

function ViewerArrow({
  side, label, onClick,
}: {
  side: "left" | "right";
  label: string;
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      aria-label={label}
      className={
        "absolute top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-pill " +
        "bg-white/10 text-white transition-colors hover:bg-white/25 " +
        (side === "left" ? "left-3 sm:left-6" : "right-3 sm:right-6")
      }
    >
      <Icon size={24} aria-hidden="true" />
    </button>
  );
}
