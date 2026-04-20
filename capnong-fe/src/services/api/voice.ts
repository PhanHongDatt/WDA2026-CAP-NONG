/**
 * API Voice Service — Khớp BE VoiceController
 *
 * BE Endpoints:
 *   POST /api/voice/extract  → Trích xuất thông tin SP từ transcript giọng nói
 *     Body: { transcript: string (5-2000 ký tự), language: "vi-VN" }
 *     Response: VoiceProductExtractionResponse (mỗi field có confidence: HIGH/MEDIUM/LOW)
 *
 *   POST /api/voice/extract/raw → Extract dạng raw (gửi audio blob)
 *
 * Roles: FARMER, HTX_MEMBER, HTX_MANAGER
 */
import api from "../api";

export interface VoiceExtractValue<T> {
  value?: T;
  confidence?: number;
  confidence_level?: "high" | "medium" | "low";
  raw_value?: string;
}

export interface VoiceExtractResult {
  product_name?: VoiceExtractValue<string>;
  description?: VoiceExtractValue<string>;
  price_per_unit?: VoiceExtractValue<number>;
  price_unit?: VoiceExtractValue<string>;
  quantity?: VoiceExtractValue<number>;
  quantity_unit?: VoiceExtractValue<string>;
  location?: VoiceExtractValue<string>;
  harvest_date?: VoiceExtractValue<string>;
  farming_method?: VoiceExtractValue<string>;
  original_transcript?: string;
  processing_notes?: string[];
  
  // Legacy fields for backward compatibility, optional:
  name?: unknown;
  nameConfidence?: unknown;
  category?: unknown;
  categoryConfidence?: unknown;
  unitCode?: unknown;
  unitCodeConfidence?: unknown;
  rawUnitText?: unknown;
  pricePerUnit?: unknown;
  pricePerUnitConfidence?: unknown;
  availableQuantity?: unknown;
  availableQuantityConfidence?: unknown;
  harvestNote?: unknown;
  rawTranscript?: unknown;
}

/**
 * Extract product info from voice transcript text
 */
export async function extractFromTranscript(
  transcript: string,
  language: string = "vi-VN"
): Promise<VoiceExtractResult> {
  const res = await api.post("/api/voice/extract", { transcript, language }, { timeout: 60000 });
  return res.data.data || res.data;
}

/**
 * Extract product info from raw audio blob
 */
export async function extractFromAudio(audioBlob: Blob): Promise<VoiceExtractResult> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");
  const res = await api.post("/api/voice/extract/raw", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data || res.data;
}
