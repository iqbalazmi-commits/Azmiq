"use client";

import { useRef, useState } from "react";
import { Box, Loader2, Smartphone, X } from "lucide-react";
import { buttonStyles } from "@/components/ui/Button";
import type { Product3D } from "@/lib/product-3d";

/* "View in 3D", and on a phone "See it in your room".

   The 3D viewer (Google's <model-viewer>, which brings three.js with it) is
   only downloaded when someone presses the button, so product pages stay as
   light as they were. On a phone, model-viewer hands the same model to the
   phone's own AR viewer (Scene Viewer on Android, Quick Look on iPhone),
   which places it on a real table at its real size. */

export function View3D({ model, title }: { model: Product3D; title: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  async function open() {
    dialog.current?.showModal();
    if (ready) return;
    try {
      await import("@google/model-viewer");
      setReady(true);
    } catch {
      setFailed(true);
    }
  }

  return (
    <>
      <button type="button" onClick={open} className={buttonStyles("secondary", "sm", "mt-4 w-full")}>
        <Box size={16} aria-hidden="true" />
        View in 3D
        <span className="sr-only">: {title}</span>
      </button>

      <dialog
        ref={dialog}
        aria-label={`${title} in 3D`}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
        className="m-auto h-[min(44rem,calc(100dvh-2rem))] w-[min(40rem,calc(100%-2rem))] overflow-hidden rounded-lg border border-border bg-surface-raised p-0 text-ink shadow-xl backdrop:bg-black/60"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
            <p className="font-serif text-lg leading-tight text-ink">{title}</p>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              aria-label="Close 3D view"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-ink-muted hover:text-ink"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <div className="relative flex-1 bg-surface-sunken">
            {ready ? (
              <model-viewer
                src={model.src}
                alt={model.alt}
                ar
                ar-modes="scene-viewer quick-look webxr"
                ar-scale="fixed"
                camera-controls
                auto-rotate
                touch-action="pan-y"
                environment-image="neutral"
                shadow-intensity="1"
                exposure="1.05"
                camera-orbit="20deg 80deg auto"
                style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
              >
                {/* Only shown by model-viewer on devices that can do AR. */}
                <button
                  slot="ar-button"
                  type="button"
                  className={buttonStyles("primary", "md", "absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap")}
                >
                  <Smartphone size={17} aria-hidden="true" />
                  See it in your room
                </button>
              </model-viewer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-ink-muted">
                {failed ? (
                  "The 3D view could not load. Please try again."
                ) : (
                  <span className="flex items-center gap-2">
                    <Loader2 size={17} className="animate-spin" aria-hidden="true" />
                    Loading 3D view
                  </span>
                )}
              </div>
            )}
          </div>

          <p className="border-t border-border px-5 py-3 text-center text-xs text-ink-muted">
            Drag to turn it, pinch or scroll to zoom. Shown at its real size; the finish of each
            handmade piece varies a little.
          </p>
        </div>
      </dialog>
    </>
  );
}
