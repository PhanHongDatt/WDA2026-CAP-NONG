/**
 * API AI Service — Khớp BE AiController
 *
 * BE Endpoints (prefix /api/ai):
 *   POST /api/ai/refine-description      → Chỉnh sửa mô tả SP { rawText, productName }
 *   POST /api/ai/caption                 → Tạo caption marketing (async → sessionId)
 *   POST /api/ai/poster                  → Tạo poster (async → sessionId)
 *   POST /api/ai/voice-session           → Voice-to-Product (async → sessionId)
 *   GET  /api/ai/sessions/{sessionId}    → Poll kết quả AI session
 *
 * Response pattern:
 *   Sync:  ApiResponse<T>
 *   Async: ApiResponse<{ sessionId, status }> → poll GET /api/ai/sessions/{id}
 *
 * Roles: FARMER+ cho hầu hết
 */
import api from "../api";


/* ─── Refine Description (sync) ─── */
export interface RefineResult {
  refinedText: string;
  changesSummary: string;
}

export async function refineDescription(rawText: string, productName?: string): Promise<RefineResult> {
  const res = await api.post("/api/ai/refine-description", { rawText, productName });
  return res.data.data || res.data;
}

/* ─── AI Session Polling ─── */
export interface AiSessionResult {
  sessionId: string;
  status: "IN_PROGRESS" | "COMPLETED" | "FAILED";
  type?: string;
  data?: unknown;
  errorMessage?: string;
  captions?: CaptionResult[];
  posterContent?: PosterContent;
  posterImageUrl?: string;
}

/**
 * Poll AI session result — GET /api/ai/sessions/{sessionId}
 */
export async function pollSessionResult(sessionId: string): Promise<AiSessionResult> {
  const res = await api.get(`/api/ai/sessions/${sessionId}`, { timeout: 15000 });
  const raw = res.data.data || res.data;
  // Normalize snake_case → camelCase
  return {
    sessionId: raw.sessionId || raw.session_id,
    status: raw.status,
    type: raw.type || raw.session_type,
    data: raw.data,
    errorMessage: raw.errorMessage || raw.error_message,
    captions: raw.captions || raw.caption,
    posterContent: raw.posterContent || raw.poster,
    posterImageUrl: raw.posterImageUrl || raw.poster_image_url,
  };
}

/**
 * Poll until completed or failed (max 60s, poll every 2s)
 */
export async function waitForSession(sessionId: string, maxWaitMs = 180000): Promise<AiSessionResult> {
  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitMs) {
    const result = await pollSessionResult(sessionId);
    if (result.status === "COMPLETED" || result.status === "FAILED") {
      return result;
    }
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error("AI session timed out");
}

/* ─── Generate Captions (async) ─── */
export type CaptionStyle = "FUNNY" | "RUSTIC" | "PROFESSIONAL";

export interface CaptionResult {
  style: string;
  text: string;
  hashtags: string[];
}

/**
 * Start caption session — POST /api/ai/caption
 * Returns sessionId → poll via GET /api/ai/sessions/{id}
 */
export async function generateCaptions(data: {
  productName: string;
  description: string;
  province?: string;
  style: CaptionStyle;
}): Promise<CaptionResult[]> {

  const res = await api.post("/api/ai/caption", data);
  const sessionData = res.data.data || res.data;

  // BE trả sessionId → poll để lấy kết quả
  if (sessionData.sessionId) {
    const result = await waitForSession(sessionData.sessionId);
    if (result.status === "FAILED") {
      throw new Error(result.errorMessage || "Caption generation failed");
    }
    // Extract captions from session result
    const resultData = result.data as Record<string, unknown> | undefined;
    return (result.captions || resultData?.captions || []) as CaptionResult[];
  }

  // Fallback: nếu BE trả trực tiếp (không async)
  return sessionData.captions || sessionData || [];
}

/* ─── Poster Content (async) ─── */
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
  // AI_IMAGE mode
  imageUrl?: string;
  promptUsed?: string;
}

/**
 * Start poster session — POST /api/ai/poster
 * Mode: "HTML" (text content) hoặc "AI_IMAGE" (Gemini generate image)
 */
export async function generatePosterContent(data: {
  productName: string;
  pricePerUnit?: number;
  unitCode?: string;
  availableQuantity?: number;
  shopName: string;
  province: string;
  farmingMethod?: string;
  pesticideFree?: boolean;
  templateId?: string;
  bgRemovedImageUrl?: string;
  mode?: "HTML" | "AI_IMAGE";
  imageModel?: string;
}): Promise<PosterContent> {

  // BE nhận snake_case
  const body: Record<string, unknown> = {
    product_name: data.productName,
    description: data.productName,
    province: data.province,
    price_display: data.pricePerUnit ? `${data.pricePerUnit.toLocaleString("vi-VN")}đ/${data.unitCode || "kg"}` : undefined,
    shop_name: data.shopName,
    template: data.templateId || "FRESH_GREEN",
    image_url: data.bgRemovedImageUrl || undefined,
    mode: data.mode || "HTML",
  };
  if (data.imageModel) body.image_model = data.imageModel;

  const res = await api.post("/api/ai/poster", body, { timeout: 30000 });
  const sessionData = res.data.data || res.data;

  // BE trả sessionId hoặc session_id
  const sessionId = sessionData.sessionId || sessionData.session_id;
  if (sessionId) {
    const result = await waitForSession(sessionId);
    if (result.status === "FAILED") {
      throw new Error(result.errorMessage || "Poster generation failed");
    }
    // Extract poster data from session result
    // BE (snake_case Jackson): { poster: { mode, image_base64?, mime_type?, headline?, ... } }
    const poster = (result.posterContent || {}) as Record<string, unknown>;
    console.log("[AI] Session result posterContent:", JSON.stringify(poster).substring(0, 300));
    console.log("[AI] poster.mode:", poster.mode, "| poster.image_base64 exists:", !!poster.image_base64);

    // AI_IMAGE mode: poster.image_base64 contains the generated image
    let imageUrl: string | undefined;
    let promptUsed: string | undefined;
    const mode = poster.mode as string | undefined;

    if (mode === "AI_IMAGE" || poster.image_base64) {
      const b64 = poster.image_base64 as string | undefined;
      const mime = (poster.mime_type as string) || "image/png";
      console.log("[AI] AI_IMAGE detected. b64 length:", b64?.length, "| mime:", mime);
      if (b64) imageUrl = `data:${mime};base64,${b64}`;
      promptUsed = (poster.prompt_used as string) || undefined;
    }

    // HTML mode fields
    return {
      templateId: (poster.template as string) || "",
      headline: (poster.headline as string) || "",
      tagline: (poster.tagline as string) || "",
      priceDisplay: (poster.price_display as string) || "",
      badgeTexts: (poster.badge_texts as string[]) || [],
      shopDisplay: (poster.shop_display as string) || "",
      ctaText: (poster.cta_text as string) || "",
      colorScheme: poster.color_scheme as PosterContent["colorScheme"] || {
        primary: "#2d6a4f",
        accent: "#95d5b2",
        textOnPrimary: "#ffffff",
      },
      imageUrl,
      promptUsed,
    } as PosterContent;
  }

  return sessionData;
}

/* ─── Voice Session (async) ─── */
export async function startVoiceSession(data: {
  transcript: string;
  language?: string;
  audioFileUrl?: string;
}): Promise<{ sessionId: string }> {
  const res = await api.post("/api/ai/voice-session", {
    transcript: data.transcript,
    language: data.language || "vi-VN",
    audioFileUrl: data.audioFileUrl,
  });
  const sessionData = res.data.data || res.data;
  return { sessionId: String(sessionData.sessionId) };
}

/* ─── Crop Health (nếu BE có) ─── */
export interface CropHealthResult {
  diagnosis: string;
  confidence: number;
  recommendations: string[];
}

export async function analyzeCropHealth(imageBase64: string, cropType?: string): Promise<CropHealthResult> {
  const res = await api.post("/api/ai/crop-health", { imageBase64, cropType });
  return res.data.data || res.data;
}

/* ─── Price Advice (nếu BE có) ─── */
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
  const res = await api.post("/api/ai/price-advice", data);
  return res.data.data || res.data;
}
