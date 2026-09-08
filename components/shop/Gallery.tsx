"use client";

import { useState } from "react";
import { Media } from "@/components/ui/Media";

type Image = { url: string; alt: string; kind: string; width: number; height: number };

const KIND_LABEL: Record<string, string> = {
  hero: "Full view",
  macro: "Texture close-up",
  lifestyle: "In use",
  scale: "Shown for scale",
};

/* The first image is always rendered by the server as the LCP element. Only
   the *switching* is client-side, so a customer on a slow connection sees the
   product before any JavaScript arrives. */

export function Gallery({ images, title }: { images: Image[]; title: string }) {
  const [active, setActive] = useState(0);
  if (images.length === 0) return <div className="media-portrait rounded-lg bg-surface-sunken" />;

  const current = images[Math.min(active, images.length - 1)];

  return (
    <div className="flex flex-col gap-4 lg:flex-row-reverse lg:gap-6">
      <figure className="min-w-0 flex-1">
        <Media
          src={current.url}
          alt={current.alt}
          width={current.width}
          height={current.height}
          sizes="(min-width: 1024px) 46vw, 100vw"
          priority={active === 0}
          aspect={current.kind === "macro" ? "square" : "portrait"}
          className="rounded-lg border border-border"
        />
        {KIND_LABEL[current.kind] ? (
          <figcaption className="mt-3 text-xs uppercase tracking-widest text-ink-muted">
            {KIND_LABEL[current.kind]}
          </figcaption>
        ) : null}
      </figure>

      {images.length > 1 ? (
        <div
          role="tablist"
          aria-label={`${title} images`}
          aria-orientation="horizontal"
          className="flex gap-3 overflow-x-auto lg:flex-col lg:overflow-visible"
        >
          {images.map((image, index) => {
            const selected = index === active;
            return (
              <button
                key={image.url}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-label={`${KIND_LABEL[image.kind] ?? "View"} ${index + 1} of ${images.length}`}
                onClick={() => setActive(index)}
                className={
                  "h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-colors lg:h-24 lg:w-24 " +
                  (selected ? "border-surface-brand" : "border-border hover:border-border-control")
                }
              >
                <Media
                  src={image.url}
                  alt=""
                  width={200}
                  height={200}
                  sizes="96px"
                  aspect="square"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
