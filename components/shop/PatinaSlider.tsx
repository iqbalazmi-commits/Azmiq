"use client";

import { useId, useState } from "react";
import type { PatinaImages } from "@/lib/patina";

/* "Watch it age": drag to see the copper deepen from new to a year of use.
   The three pictures are stacked and cross-faded, so the slider is smooth
   and the page loads only three small images. The aged ones are
   illustrations made from the real photo, and the caption says so. */

const STAGES = ["New", "A few months", "A year or more"] as const;

export function PatinaSlider({ images, title }: { images: PatinaImages; title: string }) {
  const [value, setValue] = useState(0);
  const id = useId();
  const months = Math.min(1, value / 50);
  const year = Math.max(0, (value - 50) / 50);
  const stage = value < 25 ? 0 : value < 75 ? 1 : 2;

  return (
    <div className="grid items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
      <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-lg border border-border bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element -- plain stacked images cross-fade more smoothly than next/image wrappers */}
        <img src={images.new} alt={`${title}, new`} className="absolute inset-0 h-full w-full object-contain" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images.months}
          alt=""
          aria-hidden="true"
          loading="lazy"
          style={{ opacity: months }}
          className="absolute inset-0 h-full w-full object-contain"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images.year}
          alt=""
          aria-hidden="true"
          loading="lazy"
          style={{ opacity: year }}
          className="absolute inset-0 h-full w-full object-contain"
        />
        <span className="absolute left-3 top-3 rounded-sm bg-surface-raised/90 px-2.5 py-1 text-2xs uppercase tracking-widest text-ink">
          {STAGES[stage]}
        </span>
      </div>

      <div>
        <p className="eyebrow">Real copper, living finish</p>
        <h2 className="mt-3 font-serif text-3xl text-ink">Watch it age</h2>
        <hr className="rule-accent mt-6" />
        <p className="mt-6 leading-relaxed text-ink-muted">
          Pure copper slowly deepens from bright orange to a rich bronze as it meets air and water.
          It is a natural patina, not a fault: the sign that what you hold is real copper and not a
          coating. Drag to see how yours will change.
        </p>

        <label htmlFor={id} className="sr-only">
          How the copper looks over time
        </label>
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(event) => setValue(Number(event.target.value))}
          aria-valuetext={STAGES[stage]}
          className="mt-8 w-full accent-[var(--color-surface-brand)]"
        />
        <div className="mt-2 flex justify-between text-xs text-ink-muted">
          {STAGES.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <p className="mt-7 text-sm leading-relaxed text-ink-muted">
          Prefer the shine? Lemon and salt brings it back in about a minute.
        </p>
        <p className="mt-3 text-xs text-ink-muted">
          Illustration based on our product photo. Every piece ages at its own pace, depending on
          use and water.
        </p>
      </div>
    </div>
  );
}
