"use client";

import { Download, ImageIcon } from "lucide-react";
import type { GalleryImage } from "@/app/actions/gallery";

type Props = {
  images: GalleryImage[];
};

export function GalleryGrid({ images }: Props) {
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/50 px-8 py-20 text-center">
        <ImageIcon className="size-10 text-[var(--muted)]" aria-hidden />
        <p className="max-w-sm text-sm text-[var(--muted)]">
          No photos are in this folder yet. If you expected images here, contact the studio.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {images.map((img) => (
        <li
          key={img.key}
          className="group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm shadow-black/20"
        >
          <div className="relative aspect-[4/3] bg-black/40">
            {/* eslint-disable-next-line @next/next/no-img-element -- presigned R2 URLs */}
            <img src={img.url} alt={img.name} className="h-full w-full object-cover" loading="lazy" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-[var(--border)] px-3 py-2.5">
            <p className="min-w-0 truncate text-xs text-[var(--muted)]" title={img.name}>
              {img.name}
            </p>
            <a
              href={img.downloadUrl}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:border-[var(--accent-muted)] hover:text-[var(--accent)]"
            >
              <Download className="size-3.5" aria-hidden />
              Download
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
