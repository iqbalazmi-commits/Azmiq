"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2 } from "lucide-react";
import { uploadProductImage } from "@/lib/actions/admin";

/* Phone photos are often 5-10 MB. Each one is shrunk here, in the browser, to
   at most 2000px on its long side as a JPEG before it is sent, so uploads are
   quick on mobile data and every request stays far under the hosting limit.
   Photos are sent one at a time for the same reason. */

const MAX_EDGE = 2000;
const QUALITY = 0.85;

type Shrunk = { blob: Blob; width: number; height: number };

async function shrink(file: File): Promise<Shrunk> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  // White behind transparent PNGs, otherwise they turn black as JPEGs.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", QUALITY));
  if (!blob) throw new Error("encode failed");
  return { blob, width, height };
}

export function PhotoUploader({ productId }: { productId: string }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ text: string; error?: boolean } | null>(null);

  function onChoose(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files);

    startTransition(async () => {
      let added = 0;
      const failed: string[] = [];

      for (const [index, file] of list.entries()) {
        setStatus({ text: `Uploading photo ${index + 1} of ${list.length}…` });
        try {
          const { blob, width, height } = await shrink(file);
          const form = new FormData();
          form.set("productId", productId);
          form.set("file", new File([blob], "photo.jpg", { type: "image/jpeg" }));
          form.set("width", String(width));
          form.set("height", String(height));
          const result = await uploadProductImage(form);
          if (result?.ok) added++;
          else failed.push(`${file.name}: ${result && !result.ok ? result.error : "failed"}`);
        } catch {
          failed.push(`${file.name}: could not read this photo`);
        }
      }

      if (input.current) input.current.value = "";
      router.refresh();
      setStatus(
        failed.length
          ? { text: `${added} added. Not added: ${failed.join("; ")}`, error: true }
          : { text: added === 1 ? "Photo added." : `${added} photos added.` },
      );
    });
  }

  return (
    <div className="mt-5">
      <label
        className={
          "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-border-control px-4 text-sm text-ink hover:border-ink" +
          (pending ? " pointer-events-none opacity-50" : "")
        }
      >
        {pending ? (
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
        ) : (
          <ImagePlus size={16} aria-hidden="true" />
        )}
        Add photos
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          multiple
          disabled={pending}
          onChange={(e) => onChoose(e.target.files)}
          className="sr-only"
        />
      </label>
      <p role="status" aria-live="polite" className="mt-2 text-sm">
        {status ? <span className={status.error ? "text-danger" : "text-ink-muted"}>{status.text}</span> : null}
      </p>
    </div>
  );
}
