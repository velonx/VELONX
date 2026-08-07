'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

interface PostImageGalleryProps {
  images: string[];
}

/**
 * PostImageGallery — single-frame carousel for community post images.
 *
 * Every image is shown in full (object-contain) over a blurred backdrop of
 * itself, so portrait, landscape and square uploads all display cleanly
 * without awkward cropping. When a post has more than one image, prev/next
 * arrows, dot indicators and a counter let the viewer scroll through them.
 */
export function PostImageGallery({ images }: PostImageGalleryProps) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) return null;

  const count = images.length;
  const clamped = Math.min(index, count - 1);
  const current = images[clamped];
  const hasMultiple = count > 1;

  const goTo = (i: number) => setIndex(((i % count) + count) % count);
  const goPrev = () => goTo(clamped - 1);
  const goNext = () => goTo(clamped + 1);

  return (
    <div className="relative mt-3 overflow-hidden rounded-xl border border-border bg-muted/40">
      <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
        {/* Blurred backdrop so any aspect ratio letterboxes cleanly */}
        <div
          aria-hidden
          className="absolute inset-0 scale-110 bg-cover bg-center opacity-40 blur-2xl"
          style={{ backgroundImage: `url("${current}")` }}
        />

        {/* Actual image — fully visible, opens full size in a new tab */}
        <a
          key={current}
          href={current}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`View image ${clamped + 1} of ${count} in new tab`}
        >
          <Image
            src={current}
            alt={`Post image ${clamped + 1}`}
            fill
            quality={80}
            sizes="(max-width: 640px) 100vw, 640px"
            className="object-contain"
          />
        </a>

        {hasMultiple && (
          <>
            {/* Prev / next arrows */}
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-background/70 text-foreground shadow-sm backdrop-blur-sm transition hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronLeftIcon className="size-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-background/70 text-foreground shadow-sm backdrop-blur-sm transition hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronRightIcon className="size-5" />
            </button>

            {/* Counter */}
            <div className="absolute right-2 top-2 rounded-full bg-background/70 px-2 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm">
              {clamped + 1}/{count}
            </div>
          </>
        )}
      </div>

      {hasMultiple && (
        // Dot indicators
        <div className="flex items-center justify-center gap-1.5 py-2">
          {images.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to image ${i + 1}`}
              aria-current={i === clamped}
              className={`h-1.5 rounded-full transition-all ${
                i === clamped ? 'w-4 bg-primary' : 'w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
