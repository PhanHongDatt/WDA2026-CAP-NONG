// ─── AI Types (khớp API Contract: AI endpoints) ───

// Voice-to-Product
export interface VoiceExtractRequest {
  transcript: string;
}

export interface VoiceExtractResponse {
  name?: string;
  description?: string;
  category?: string;
  unit_code?: string;
  raw_unit_text?: string;
  price_per_unit?: number;
  available_quantity?: number;
  harvest_note?: string;
  confidence_scores: {
    name: number;
    price_per_unit: number;
    available_quantity: number;
    unit_code: number;
    category: number;
  };
  raw_transcript: string;
}

// AI Input Refiner
export interface RefineDescriptionRequest {
  raw_text: string;
  product_name?: string;
}

export interface RefineDescriptionResponse {
  refined_text: string;
  changes_summary: string;
}

// Caption Generator
export type CaptionStyle = "FUNNY" | "RUSTIC" | "PROFESSIONAL";

export interface CaptionRequest {
  product_name: string;
  description: string;
  province?: string;
  style: CaptionStyle;
}

export interface CaptionResult {
  style: string;
  text: string;
  hashtags: string[];
}

export interface CaptionResponse {
  captions: CaptionResult[];
}

// Poster Generator
export type PosterTemplate = "FRESH_GREEN" | "WARM_HARVEST" | "MINIMAL_WHITE";

export interface PosterContentRequest {
  product_name: string;
  price_per_unit: number;
  unit_code: string;
  available_quantity?: number;
  shop_name: string;
  province: string;
  farming_method?: string;
  pesticide_free?: boolean;
  template_id?: PosterTemplate;
  bg_removed_image_url?: string;
}

export interface PosterContentResponse {
  template_id: string;
  headline: string;
  tagline: string;
  price_display: string;
  badge_texts: string[];
  shop_display: string;
  cta_text: string;
  color_scheme: {
    primary: string;
    accent: string;
    text_on_primary: string;
  };
}

// Remove Background
export interface RemoveBgRequest {
  image_base64: string;
}

export interface RemoveBgResponse {
  image_url: string;
}
