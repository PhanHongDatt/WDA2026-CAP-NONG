export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  unit: string; // kg, trái, khay, etc.
  stock: number;
  category: string;
  images: string[];
  shopId: number;
  shopName: string;
  shopAvatar?: string;
  shopLocation: string;
  rating: number;
  soldCount: number;
  badges: ProductBadge[];
  traceability: TraceabilityInfo;
  seasonStatus: "IN_SEASON" | "UPCOMING" | "OUT_OF_STOCK";
  createdAt: string;
  updatedAt: string;
}

export interface ProductBadge {
  label: string;
  type: "organic" | "certification" | "harvest" | "promo";
}

export interface TraceabilityInfo {
  cooperative: string;
  regionCode: string;
  harvestDate: string;
  farmingMethod: string;
  certification: string;
  isOrganic: boolean;
  farmLocation: string;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  productCount?: number;
}

export interface ProductFilter {
  category?: string;
  region?: string;
  season?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "popular";
  page?: number;
  size?: number;
}
