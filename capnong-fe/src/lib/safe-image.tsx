/**
 * SafeImage — Drop-in replacement for next/image that handles external URLs
 *
 * Next.js 16 Turbopack has a persistent bug where remotePatterns config is
 * not correctly resolved when a parent directory has a package-lock.json.
 * This component uses native <img> for external URLs to bypass the issue.
 *
 * For local/internal images, it delegates to next/image as usual.
 * Includes onError fallback to show a green placeholder instead of broken icon.
 */
"use client";

import { useState } from "react";
import Image from "next/image";

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  blurDataURL?: string;
  priority?: boolean;
  fill?: boolean;
  style?: React.CSSProperties;
}

function Placeholder({ alt, className, style, fill }: { alt: string; className?: string; style?: React.CSSProperties; fill?: boolean }) {
  // Use a simple hash of the alt text to pick a consistent local fallback image
  const fallbackImages = [
    "/images/banners/banner-traicay.png",
    "/images/banners/banner-dalat.png",
    "/images/banners/banner-gomdon.png",
  ];
  
  const hash = Array.from(alt || "unknown").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const src = fallbackImages[hash % fallbackImages.length];

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      /* Cache Buster 3x */
      alt={`${alt} (Fallback)`}
      className={className}
      style={{
        width: fill ? "100%" : (style?.width || "100%"),
        height: fill ? "100%" : (style?.height || "100%"),
        ...style,
        objectFit: "cover",
      }}
    />
  );
}

export function SafeImage({ src, alt, width, height, className, blurDataURL: _blurDataURL, priority, fill, sizes, style }: SafeImageProps) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState(false);

  // If src is empty/null or errored → show placeholder
  if (!src || error) {
    return <Placeholder alt={alt} className={className} style={fill ? { position: "absolute", inset: 0, objectFit: "cover", ...style } : style} fill={fill} />;
  }

  // External URLs — use native <img> to bypass Next.js hostname validation
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={fill ? { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", ...style } : style}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onError={() => setError(true)}
      />
    );
  }

  // Local images — use next/image for optimization
  return (
    <Image
      src={src}
      alt={alt}
      width={fill ? undefined : (width || 400)}
      height={fill ? undefined : (height || 400)}
      sizes={sizes}
      className={className}
      priority={priority}
      fill={fill}
      style={style}
      onError={() => setError(true)}
    />
  );
}
