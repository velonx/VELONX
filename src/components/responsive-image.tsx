"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  fill?: boolean;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  loading?: "lazy" | "eager";
}

/**
 * Responsive Image Component with lazy loading and optimization
 * 
 * Features:
 * - Lazy loading by default
 * - Responsive srcset generation
 * - Automatic image optimization
 * - Loading placeholder
 * - Error handling
 */
export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  quality = 75,
  sizes,
  fill = false,
  objectFit = "cover",
  loading = "lazy",
}: ResponsiveImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading === "eager") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "50px", // Start loading 50px before image enters viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority, loading]);

  // Default sizes if not provided
  const defaultSizes = sizes || "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw";

  if (fill) {
    return (
      <div ref={imgRef} className={`relative ${className}`}>
        {isInView && !hasError && (
          <>
            {isLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            <Image
              src={src}
              alt={alt}
              fill
              quality={quality}
              sizes={defaultSizes}
              className={`${objectFit === "cover" ? "object-cover" : objectFit === "contain" ? "object-contain" : ""} transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
              onLoadingComplete={() => setIsLoading(false)}
              onError={() => {
                setHasError(true);
                setIsLoading(false);
              }}
              priority={priority}
            />
          </>
        )}
        {hasError && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
            Failed to load image
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={imgRef} className={`relative ${className}`} style={{ width, height }}>
      {isInView && !hasError && (
        <>
          {isLoading && (
            <div
              className="absolute inset-0 bg-gray-200 animate-pulse rounded"
              style={{ width, height }}
            />
          )}
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            quality={quality}
            sizes={defaultSizes}
            className={`transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
            onLoadingComplete={() => setIsLoading(false)}
            onError={() => {
              setHasError(true);
              setIsLoading(false);
            }}
            priority={priority}
          />
        </>
      )}
      {hasError && (
        <div
          className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400 text-sm rounded"
          style={{ width, height }}
        >
          Failed to load image
        </div>
      )}
    </div>
  );
}

/**
 * Avatar Image Component - Optimized for profile pictures
 */
export function AvatarImage({
  src,
  alt,
  size = 40,
  className = "",
}: {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}) {
  return (
    <ResponsiveImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      quality={80}
      sizes={`${size}px`}
      objectFit="cover"
    />
  );
}

/**
 * Hero Image Component - Optimized for large hero sections
 */
export function HeroImage({
  src,
  alt,
  className = "",
  priority = true,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <ResponsiveImage
      src={src}
      alt={alt}
      fill
      className={className}
      quality={85}
      sizes="100vw"
      objectFit="cover"
      priority={priority}
    />
  );
}

/**
 * Card Image Component - Optimized for card thumbnails
 */
export function CardImage({
  src,
  alt,
  aspectRatio = "16/9",
  className = "",
}: {
  src: string;
  alt: string;
  aspectRatio?: "16/9" | "4/3" | "1/1" | "3/2";
  className?: string;
}) {
  const aspectRatioMap = {
    "16/9": "aspect-[16/9]",
    "4/3": "aspect-[4/3]",
    "1/1": "aspect-square",
    "3/2": "aspect-[3/2]",
  };

  return (
    <div className={`relative ${aspectRatioMap[aspectRatio]} ${className}`}>
      <ResponsiveImage
        src={src}
        alt={alt}
        fill
        quality={75}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        objectFit="cover"
      />
    </div>
  );
}
