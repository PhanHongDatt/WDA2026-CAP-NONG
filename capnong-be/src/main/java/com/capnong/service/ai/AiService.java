package com.capnong.service.ai;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * AI business logic — sử dụng AiProvider (adapter) để gọi LLM.
 * Các hàm tương ứng với API Contract: voice-to-product, refine, caption, poster, crop-health.
 */
@Service
public class AiService {

    private static final Logger logger = LoggerFactory.getLogger(AiService.class);

    private final AiProvider aiProvider;
    private final ObjectMapper objectMapper;

    public AiService(AiProvider aiProvider, ObjectMapper objectMapper) {
        this.aiProvider = aiProvider;
        this.objectMapper = objectMapper;
    }

    /**
     * Voice-to-Product: trích xuất thông tin sản phẩm từ transcript giọng nói.
     */
    public Map<String, Object> voiceToProduct(String transcript) {
        String systemPrompt = """
                Bạn là AI trợ lý nông dân Việt Nam. Trích xuất thông tin sản phẩm nông sản từ lời nói.
                Trả về JSON với các trường:
                - name: tên sản phẩm (string, nullable)
                - description: mô tả (string, nullable)
                - category: phân loại (FRUIT|VEGETABLE|GRAIN|TUBER|HERB|OTHER, nullable)
                - unit_code: đơn vị cơ sở sau quy đổi (KG|G|TAN|TA|YEN|..., nullable)
                - raw_unit_text: đơn vị gốc người nói (string, nullable)
                - price_per_unit: giá/đơn vị (number, nullable)
                - available_quantity: số lượng quy đổi về đơn vị cơ sở (number, nullable)
                - harvest_note: ghi chú thu hoạch (string, nullable)
                - confidence_scores: { name, price_per_unit, available_quantity, unit_code, category } (0.0-1.0)
                - raw_transcript: transcript gốc
                
                Quy đổi đơn vị: "tạ" = 100kg, "tấn" = 1000kg, "yến" = 10kg.
                Ví dụ: "năm tạ" → quantity=500, unit_code=KG, raw_unit_text="tạ"
                """;

        String json = aiProvider.chatJson(systemPrompt, "Transcript: " + transcript);
        return parseJson(json);
    }

    /**
     * Refine Description: cải thiện mô tả sản phẩm.
     */
    public Map<String, Object> refineDescription(String rawText, String productName) {
        String systemPrompt = """
                Bạn là copywriter nông sản Việt Nam. Viết lại mô tả sản phẩm cho hấp dẫn, tự nhiên.
                Giữ thông tin gốc, thêm chi tiết về chất lượng, nguồn gốc nếu có.
                Trả về JSON: { "refined_text": "...", "changes_summary": "..." }
                """;

        String userMsg = "Sản phẩm: " + (productName != null ? productName : "không rõ")
                + "\nMô tả gốc: " + rawText;
        String json = aiProvider.chatJson(systemPrompt, userMsg);
        return parseJson(json);
    }

    /**
     * Generate Captions: tạo caption cho sản phẩm.
     */
    public Map<String, Object> generateCaptions(String productName, String description,
                                                  String province, String style) {
        String systemPrompt = """
                Tạo 3 caption bán hàng nông sản cho mạng xã hội. Style: %s.
                Trả về JSON: { "captions": [{ "style": "...", "text": "...", "hashtags": ["..."] }] }
                Mỗi caption ~100 từ, có hashtag liên quan (#nongsanviet #tuoingon ...).
                """.formatted(style);

        String userMsg = "Sản phẩm: " + productName
                + "\nMô tả: " + description
                + (province != null ? "\nTỉnh: " + province : "");
        String json = aiProvider.chatJson(systemPrompt, userMsg);
        return parseJson(json);
    }

    /**
     * Generate Poster Content: tạo nội dung poster (text only, FE render).
     */
    public Map<String, Object> generatePosterContent(Map<String, Object> input) {
        String systemPrompt = """
                Tạo nội dung text cho poster bán nông sản. KHÔNG tạo ảnh.
                Trả về JSON:
                {
                  "template_id": "FRESH_GREEN|WARM_HARVEST|MINIMAL_WHITE",
                  "headline": "tiêu đề hấp dẫn",
                  "tagline": "slogan ngắn",
                  "price_display": "giá hiển thị (VD: 25.000đ/kg)",
                  "badge_texts": ["badge1", "badge2"],
                  "shop_display": "tên shop",
                  "cta_text": "call to action",
                  "color_scheme": { "primary": "#hex", "accent": "#hex", "text_on_primary": "#hex" }
                }
                """;

        String json = aiProvider.chatJson(systemPrompt, objectMapper.valueToTree(input).toString());
        return parseJson(json);
    }

    /**
     * Crop Health Check: phân tích sức khỏe cây trồng (text-based).
     */
    public Map<String, Object> cropHealthCheck(String description, String cropType) {
        String systemPrompt = """
                Bạn là chuyên gia nông nghiệp. Phân tích triệu chứng cây trồng.
                Trả về JSON:
                {
                  "diagnosis": "chẩn đoán",
                  "confidence": 0.0-1.0,
                  "possible_causes": ["nguyên nhân 1", "nguyên nhân 2"],
                  "recommendations": ["khuyến nghị 1", "khuyến nghị 2"],
                  "severity": "LOW|MEDIUM|HIGH|CRITICAL"
                }
                """;

        String userMsg = "Loại cây: " + cropType + "\nTriệu chứng: " + description;
        String json = aiProvider.chatJson(systemPrompt, userMsg);
        return parseJson(json);
    }

    /**
     * Price Advisor: gợi ý giá dựa trên thị trường.
     */
    public Map<String, Object> priceAdvice(String productName, String province,
                                            String category, Double currentPrice) {
        String systemPrompt = """
                Bạn là chuyên gia thị trường nông sản Việt Nam. Tư vấn giá bán.
                Trả về JSON:
                {
                  "suggested_min": number,
                  "suggested_max": number,
                  "market_average": number,
                  "advice": "lời khuyên",
                  "factors": ["yếu tố 1", "yếu tố 2"]
                }
                """;

        String userMsg = "Sản phẩm: " + productName
                + "\nTỉnh: " + province
                + "\nPhân loại: " + category
                + (currentPrice != null ? "\nGiá hiện tại: " + currentPrice : "");
        String json = aiProvider.chatJson(systemPrompt, userMsg);
        return parseJson(json);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseJson(String json) {
        try {
            // Clean markdown code blocks if present
            String cleaned = json.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
            return objectMapper.readValue(cleaned, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            logger.error("Failed to parse AI response as JSON: {}", json);
            return Map.of("raw_response", json, "parse_error", e.getMessage());
        }
    }
}
