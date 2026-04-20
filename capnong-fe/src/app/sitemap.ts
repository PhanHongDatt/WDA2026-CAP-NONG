import type { MetadataRoute } from "next";

const BASE_URL = "https://capnong.vn";

// Dynamic slugs from mock data — replace with API call when backend ready
const productSlugs = [
  "cam-sanh-ha-giang-loai-1",
  "sau-rieng-ri6-dak-lak",
  "buoi-da-xanh-ben-tre",
  "xoai-cat-hoa-loc-tien-giang",
  "ca-tam-sapa-tuoi-song",
  "nam-moi-den-huu-co",
  "thit-bo-to-cu-chi",
  "rau-mam-da-ha-giang",
];

const shopSlugs = [
  "nong-trai-xanh-da-lat",
  "hop-tac-xa-ben-tre",
  "vuon-cay-an-trai-can-tho",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/home`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/catalog`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/cooperative`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  // Product pages
  const productRoutes: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${BASE_URL}/product/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Shop pages
  const shopRoutes: MetadataRoute.Sitemap = shopSlugs.map((slug) => ({
    url: `${BASE_URL}/shops/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...shopRoutes];
}
