export interface Shop {
  id: number;
  name: string;
  slug: string;
  avatar: string;
  coverImage: string;
  location: string;
  province: string;
  story: string;
  yearsOfExperience: number;
  farmArea: string; // e.g. "2 hecta"
  rating: number;
  reviewCount: number;
  productCount: number;
  soldCount: number;
  certifications: string[];
  contactAddress: string;
  openHours: string;
  galleryImages: GalleryImage[];
  createdAt: string;
}

export interface GalleryImage {
  url: string;
  caption: string;
}

export interface FarmerReview {
  id: number;
  buyerName: string;
  buyerAvatar?: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
}
