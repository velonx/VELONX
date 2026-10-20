"use client";

import { useEffect, useMemo, useState } from "react";
import { Images, Loader2 } from "lucide-react";
import { GalleryGrid, type GalleryPhoto } from "@/components/cms/GalleryGrid";

export default function GalleryClient() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/gallery")
      .then(res => res.json())
      .then(json => { if (json.success) setPhotos(json.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(photos.map(p => p.category).filter((c): c is string => !!c))),
    [photos]
  );
  const shown = category ? photos.filter(p => p.category === category) : photos;

  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-10">
          <span className="section-label-redesign">Gallery</span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mt-3 text-[#1A234A] dark:text-white">Life at Velonx</h1>
          <p className="text-muted-foreground mt-4">Hackathons, meetups, workshops and everything in between.</p>
        </div>

        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {[null, ...categories].map(c => (
              <button
                key={c ?? "all"}
                onClick={() => setCategory(c)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${category === c ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
              >
                {c ?? "All"}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : shown.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <Images className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No photos yet — check back soon.</p>
          </div>
        ) : (
          <GalleryGrid key={category ?? "all"} photos={shown} />
        )}
      </div>
    </div>
  );
}
