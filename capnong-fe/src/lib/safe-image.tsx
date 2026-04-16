/**
 * SafeImage — Drop-in replacement for next/image that handles external URLs
 *
 * Next.js 16 Turbopack has a persistent bug where remotePatterns config is
 * not correctly resolved when a parent directory has a package-lock.json.
 * This component uses native <img> for external URLs to bypass the issue.
 *
 * For local/internal images, it delegates to next/image as usual.
 */
"use client";

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

export function SafeImage({ src, alt, width, height, className, blurDataURL, priority, fill, sizes, style }: SafeImageProps) {
  // External URLs — use native <img> to bypass Next.js hostname validation
  if (src && (src.startsWith("http://") || src.startsWith("https://"))) {
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
    />
  );
}
