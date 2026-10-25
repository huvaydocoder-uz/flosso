"use client";

import { Maximize2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Lightbox } from "../Lightbox";

export type AboutPhoto = { key: string; src: string; full: string; cls: string; alt: string };

/** the showroom photos; a tap opens them full size */
export function AboutPhotos({ photos, zoom }: { photos: AboutPhoto[]; zoom: string }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {photos.map((p, i) => (
          <figure key={p.key} className={`group relative overflow-hidden rounded-[14px] bg-plaster ${p.cls}`}>
            <button type="button" onClick={() => setOpen(i)} aria-label={`${zoom}: ${p.alt}`} className="absolute inset-0 z-[1] cursor-zoom-in">
              <span className="absolute top-2.5 right-2.5 flex size-9 items-center justify-center rounded-full bg-night/40 text-white opacity-80 backdrop-blur-sm transition-[opacity,background-color] group-hover:bg-red group-hover:opacity-100">
                <Maximize2 className="size-4" aria-hidden="true" />
              </span>
            </button>
            <Image
              src={p.src}
              alt={p.alt}
              fill
              sizes="(min-width: 1024px) 40vw, 80vw"
              className="object-cover transition-transform duration-700 ease-[var(--ease-glide)] group-hover:scale-[1.04]"
            />
            <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-night/70 to-transparent px-4 pt-10 pb-3 text-[13px] font-medium text-white">
              {p.alt}
            </figcaption>
          </figure>
        ))}
      </div>
      {open !== null && (
        <Lightbox images={photos.map((p) => ({ src: p.full, alt: p.alt }))} start={open} onClose={() => setOpen(null)} />
      )}
    </>
  );
}
