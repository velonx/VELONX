"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { getCSRFToken } from "@/lib/utils/csrf";
import { matchesPath } from "@/lib/utils/banner";

export interface PublicBanner {
  id: string;
  title: string;
  message: string | null;
  imageUrl: string | null;
  ctaText: string | null;
  ctaUrl: string | null;
  frequency: "ONCE" | "EVERY_SESSION" | "EVERY_VISIT";
  pathPrefixes: string[];
  delaySeconds: number;
  closeOnBackdrop: boolean;
  updatedAt: string;
}

// Pages where the popup never appears
const EXCLUDED_PREFIXES = ["/dashboard/admin", "/auth", "/verify"];

// Editing a banner changes updatedAt, so an edited banner is shown again
const storageKey = (b: PublicBanner) => `velonx:banner:${b.id}:${b.updatedAt}`;

function safeGet(storage: () => Storage, key: string): string | null {
  try { return storage().getItem(key); } catch { return null; }
}

function safeSet(storage: () => Storage, key: string) {
  try { storage().setItem(key, "1"); } catch { /* storage unavailable */ }
}

async function track(id: string, event: "view" | "click") {
  try {
    const csrfToken = await getCSRFToken();
    await fetch(`/api/banners/${id}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
      body: JSON.stringify({ event }),
      keepalive: true,
    });
  } catch { /* analytics are best-effort */ }
}

/** Presentational card — also used for the admin live preview */
export function BannerCard({
  banner,
  onClose,
  onCta,
}: {
  banner: Pick<PublicBanner, "title" | "message" | "imageUrl" | "ctaText" | "ctaUrl">;
  onClose?: () => void;
  onCta?: () => void;
}) {
  return (
    <div className="relative w-full max-w-md bg-card text-foreground border border-border rounded-3xl shadow-2xl overflow-hidden">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close banner"
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 text-white backdrop-blur flex items-center justify-center hover:bg-black/60 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {banner.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={banner.imageUrl} alt="" className="w-full max-h-72 object-cover" />
      )}

      <div className="p-6 sm:p-8">
        <h2 id="velonx-banner-title" className="text-2xl font-black tracking-tight mb-2 pr-8 wrap-break-word">
          {banner.title}
        </h2>
        {banner.message && (
          <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line wrap-break-word">
            {banner.message}
          </p>
        )}
        {banner.ctaText && banner.ctaUrl && (
          <button
            type="button"
            onClick={onCta}
            className="mt-6 w-full h-12 rounded-2xl bg-[#F0771A] hover:bg-[#d9650f] text-white font-bold flex items-center justify-center gap-2 transition-colors"
          >
            {banner.ctaText} <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export function BannerPopup() {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useSession();
  const [banners, setBanners] = useState<PublicBanner[] | null>(null);
  const [current, setCurrent] = useState<PublicBanner | null>(null);
  // Banners closed during this page load (covers EVERY_VISIT, and storage-less browsers)
  const closedThisLoad = useRef<Set<string>>(new Set());
  // At most one banner per page view, so closing one doesn't immediately open the next
  const shownOnPath = useRef<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    let cancelled = false;
    fetch("/api/banners/active", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => { if (!cancelled && json.success) setBanners(json.data); })
      .catch(() => { /* no banner on failure */ });
    return () => { cancelled = true; };
  }, [status]);

  const isDismissed = useCallback((b: PublicBanner) => {
    if (closedThisLoad.current.has(b.id)) return true;
    if (b.frequency === "ONCE") return !!safeGet(() => localStorage, storageKey(b));
    if (b.frequency === "EVERY_SESSION") return !!safeGet(() => sessionStorage, storageKey(b));
    return false;
  }, []);

  useEffect(() => {
    if (!banners || !pathname || shownOnPath.current === pathname) return;
    if (EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p))) return;

    const next = banners.find((b) => matchesPath(b.pathPrefixes, pathname) && !isDismissed(b));
    if (!next) return;

    const timer = setTimeout(() => {
      shownOnPath.current = pathname;
      setCurrent(next);
      track(next.id, "view");
    }, Math.max(0, next.delaySeconds) * 1000);
    return () => clearTimeout(timer);
  }, [banners, pathname, isDismissed]);

  const dismiss = useCallback((b: PublicBanner) => {
    closedThisLoad.current.add(b.id);
    if (b.frequency === "ONCE") safeSet(() => localStorage, storageKey(b));
    if (b.frequency === "EVERY_SESSION") safeSet(() => sessionStorage, storageKey(b));
    setCurrent(null);
  }, []);

  const handleCta = useCallback((b: PublicBanner) => {
    track(b.id, "click");
    dismiss(b);
    if (!b.ctaUrl) return;
    if (b.ctaUrl.startsWith("/")) router.push(b.ctaUrl);
    else window.open(b.ctaUrl, "_blank", "noopener,noreferrer");
  }, [dismiss, router]);

  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && current.closeOnBackdrop) dismiss(current);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, dismiss]);

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          key={current.id}
          role="dialog"
          aria-modal="true"
          aria-labelledby="velonx-banner-title"
          className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget && current.closeOnBackdrop) dismiss(current);
          }}
        >
          <motion.div
            className="w-full flex justify-center"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            onClick={(e) => {
              if (e.target === e.currentTarget && current.closeOnBackdrop) dismiss(current);
            }}
          >
            <BannerCard banner={current} onClose={() => dismiss(current)} onCta={() => handleCta(current)} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default BannerPopup;
