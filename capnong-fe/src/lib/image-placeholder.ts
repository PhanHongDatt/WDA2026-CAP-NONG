/**
 * Image blur placeholder utilities — Paper #2: Progressive Image Loading
 *
 * Generates a tiny base64-encoded shimmer placeholder for `next/image` blur effect.
 * Usage: <Image src="..." placeholder="blur" blurDataURL={shimmer(700, 475)} />
 */

// SVG shimmer → base64
function toBase64(str: string): string {
  return typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);
}

/**
 * Generate a shimmer SVG placeholder with a gradient animation.
 * @param w — width
 * @param h — height
 * @returns base64-encoded data URI for blurDataURL
 */
export function shimmer(w: number, h: number): string {
  const svg = `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#e8f5e9" offset="20%" />
      <stop stop-color="#c8e6c9" offset="50%" />
      <stop stop-color="#e8f5e9" offset="80%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#e8f5e9" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)">
    <animate attributeName="x" from="-${w}" to="${w}" dur="1.5s" repeatCount="indefinite" />
  </rect>
</svg>`;
  return `data:image/svg+xml;base64,${toBase64(svg)}`;
}

/**
 * Static green-toned blur placeholder (no animation, smaller payload).
 * Good for product cards and thumbnails.
 */
export const BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZThmNWU5Ii8+PC9zdmc+";
