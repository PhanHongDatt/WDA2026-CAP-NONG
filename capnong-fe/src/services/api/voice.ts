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

export interface VoiceExtractResult {
  name?: string;
  nameConfidence?: string;
  description?: string;
  descriptionConfidence?: string;
  category?: string;
  categoryConfidence?: string;
  unitCode?: string;
  unitCodeConfidence?: string;
  rawUnitText?: string;
  pricePerUnit?: number;
  pricePerUnitConfidence?: string;
  availableQuantity?: number;
  availableQuantityConfidence?: string;
  harvestNote?: string;
  rawTranscript?: string;
}

/**
 * Extract product info from voice transcript text
 */
export async function extractFromTranscript(
  transcript: string,
  language: string = "vi-VN"
): Promise<VoiceExtractResult> {
  const res = await api.post("/api/voice/extract", { transcript, language });
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
