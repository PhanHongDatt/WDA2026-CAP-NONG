/**
 * API AI Service — Khớp BE AiController
 *
 * BE Endpoints (prefix /api/v1/ai):
 *   POST /refine-description    → Chỉnh sửa mô tả SP { rawText, productName }
 *   POST /captions              → Tạo caption marketing { productName, description, province, style }
 *   POST /poster-content        → Tạo nội dung poster { productName, pricePerUnit, unitCode, ... }
 *   POST /crop-health           → Phân tích sức khỏe cây trồng { imageBase64, cropType }
 *   POST /price-advice          → Tư vấn giá { productName, category, province, currentPrice }
 *
 * Roles: FARMER+ cho hầu hết, public cho crop-health và price-advice
 */
import api from "../api";

/* ─── Refine Description ─── */
export interface RefineResult {
  refinedText: string;
  changesSummary: string;
}

export async function refineDescription(rawText: string, productName?: string): Promise<RefineResult> {
  const res = await api.post("/api/v1/ai/refine-description", { rawText, productName });
  return res.data.data || res.data;
}

/* ─── Generate Captions ─── */
export type CaptionStyle = "FUNNY" | "RUSTIC" | "PROFESSIONAL";

export interface CaptionResult {
  style: string;
  text: string;
  hashtags: string[];
}

export async function generateCaptions(data: {
  productName: string;
  description: string;
  province?: string;
  style: CaptionStyle;
}): Promise<CaptionResult[]> {
  const res = await api.post("/api/v1/ai/captions", data);
  const result = res.data.data || res.data;
  return result.captions || result;
}

/* ─── Poster Content ─── */
export interface PosterContent {
  templateId: string;
  headline: string;
  tagline: string;
  priceDisplay: string;
  badgeTexts: string[];
  shopDisplay: string;
  ctaText: string;
  colorScheme: {
    primary: string;
    accent: string;
    textOnPrimary: string;
  };
}

export async function generatePosterContent(data: {
  productName: string;
  pricePerUnit: number;
  unitCode: string;
  availableQuantity?: number;
  shopName: string;
  province: string;
  farmingMethod?: string;
  pesticideFree?: boolean;
  templateId?: string;
  bgRemovedImageUrl?: string;
}): Promise<PosterContent> {
  const res = await api.post("/api/v1/ai/poster-content", data);
  return res.data.data || res.data;
}

/* ─── Crop Health ─── */
export interface CropHealthResult {
  diagnosis: string;
  confidence: number;
  recommendations: string[];
}

export async function analyzeCropHealth(imageBase64: string, cropType?: string): Promise<CropHealthResult> {
  const res = await api.post("/api/v1/ai/crop-health", { imageBase64, cropType });
  return res.data.data || res.data;
}

/* ─── Price Advice ─── */
export interface PriceAdviceResult {
  suggestedPrice: number;
  priceRange: { min: number; max: number };
  marketTrend: string;
  reasoning: string;
}

export async function getPriceAdvice(data: {
  productName: string;
  category: string;
  province: string;
  currentPrice?: number;
}): Promise<PriceAdviceResult> {
  const res = await api.post("/api/v1/ai/price-advice", data);
  return res.data.data || res.data;
}
