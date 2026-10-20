"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion } from "framer-motion";

export interface GalleryPhoto {
  id: string;
  imageUrl: string;
  title: string | null;
  caption: string | null;
  category: string | null;
}

/** Photo grid with a keyboard-navigable lightbox. */
export function GalleryGrid({ photos }: { photos: GalleryPhoto[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (delta: number) => setOpenIndex(i => (i === null ? null : (i + delta + photos.length) % photos.length)),
    [photos.length]
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex, close, step]);

  const open = openIndex !== null ? photos[openIndex] : null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((p, idx) => (
          <motion.button
            key={p.id}
            type="button"
            onClick={() => setOpenIndex(idx)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: Math.min(idx, 8) * 0.05 }}
            className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={p.title ? `Open photo: ${p.title}` : "Open photo"}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.imageUrl} alt={p.title || p.caption || "Velonx gallery photo"} loading="lazy" className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
            {(p.title || p.category) && (
              <div className="absolute inset-x-0 bottom-0 p-3 bg-linear-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                {p.category && <span className="text-[9px] font-bold uppercase tracking-wider text-white/70">{p.category}</span>}
                {p.title && <p className="text-sm font-bold text-white line-clamp-1">{p.title}</p>}
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-100 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={open.title || "Photo"}
          onClick={close}
        >
          <button onClick={close} aria-label="Close" className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"><X className="w-5 h-5" /></button>
          {photos.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); step(-1); }} aria-label="Previous photo" className="absolute left-2 md:left-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={e => { e.stopPropagation(); step(1); }} aria-label="Next photo" className="absolute right-2 md:right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"><ChevronRight className="w-5 h-5" /></button>
            </>
          )}
          <figure className="max-w-5xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={open.imageUrl} alt={open.title || open.caption || "Velonx gallery photo"} className="max-h-[78vh] w-auto rounded-xl object-contain" />
            {(open.title || open.caption) && (
              <figcaption className="mt-4 text-center text-white max-w-2xl">
                {open.title && <p className="font-bold">{open.title}</p>}
                {open.caption && <p className="text-sm text-white/70 mt-1">{open.caption}</p>}
              </figcaption>
            )}
            <p className="text-xs text-white/40 mt-2">{openIndex! + 1} / {photos.length}</p>
          </figure>
        </div>
      )}
    </>
  );
}
