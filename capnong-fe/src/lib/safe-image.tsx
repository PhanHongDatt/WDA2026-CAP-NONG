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

/** Green SVG placeholder shown when image fails to load */
function Placeholder({ alt, className, style }: { alt: string; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#e8f5e9",
        color: "#66bb6a",
        fontSize: "0.65rem",
        fontWeight: 600,
        textAlign: "center",
        padding: "4px",
        width: "100%",
        height: "100%",
        ...style,
      }}
      title={alt}
    >
      🌿
    </div>
  );
}

export function SafeImage({ src, alt, width, height, className, blurDataURL, priority, fill, sizes, style }: SafeImageProps) {
  const [error, setError] = useState(false);

  // If src is empty/null or errored → show placeholder
  if (!src || error) {
    return <Placeholder alt={alt} className={className} style={fill ? { position: "absolute", inset: 0, objectFit: "cover", ...style } : style} />;
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
