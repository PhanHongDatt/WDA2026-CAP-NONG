/**
 * Custom Image Loader — Bypass Next.js image hostname validation
 *
 * Next.js 16 Turbopack has a bug where it resolves next.config from workspace root
 * instead of project root, causing remotePatterns to be ignored.
 * This loader returns URLs directly, bypassing the validation entirely.
 *
 * Usage: <Image loader={directLoader} src="https://..." ... />
 * Or set as default in next.config: images.loader = "custom", images.loaderFile = "./src/lib/image-loader.ts"
 */

interface ImageLoaderParams {
  src: string;
  width: number;
  quality?: number;
}

export default function directLoader({ src, width, quality }: ImageLoaderParams): string {
  // If already a full URL, return as-is (with optional resize params for unsplash)
  if (src.startsWith("https://images.unsplash.com")) {
    // Unsplash supports dynamic resizing via URL params
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality || 75));
    return url.toString();
  }

  // For other external URLs, return as-is
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  // For local images, use Next.js default behavior
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
}
