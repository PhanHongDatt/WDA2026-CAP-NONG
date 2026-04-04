package com.capnong.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response trả về FE — Kết quả trích xuất thông tin sản phẩm từ giọng nói.
 * Map 1:1 với {@code ProductExtraction} schema của AI service (Python).
 *
 * <p>Mỗi field sản phẩm đi kèm confidence score để FE hiển thị mức độ tin cậy
 * và highlight các trường cần người dùng xác nhận lại.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class VoiceProductExtractionResponse {

    /** Tên sản phẩm nông sản (vd: "Xoài cát Chu") */
    @JsonProperty("product_name")
    private FieldWithConfidence productName;

    /** Mô tả sản phẩm */
    private FieldWithConfidence description;

    /** Đơn giá (VND) */
    @JsonProperty("price_per_unit")
    private FieldWithConfidence pricePerUnit;

    /** Đơn vị giá (kg, trái, bó...) */
    @JsonProperty("price_unit")
    private FieldWithConfidence priceUnit;

    /** Sản lượng (đã quy đổi về kg nếu là trọng lượng) */
    private FieldWithConfidence quantity;

    /** Đơn vị sản lượng (sau quy đổi) */
    @JsonProperty("quantity_unit")
    private FieldWithConfidence quantityUnit;

    /** Ngày thu hoạch (ISO date string hoặc mô tả) */
    @JsonProperty("harvest_date")
    private FieldWithConfidence harvestDate;

    /** Phương pháp canh tác (hữu cơ / thông thường / VietGAP) */
    @JsonProperty("farming_method")
    private FieldWithConfidence farmingMethod;

    /** Vị trí (tỉnh/huyện nếu có) */
    private FieldWithConfidence location;

    /** Transcript gốc từ FE */
    @JsonProperty("original_transcript")
    private String originalTranscript;

    /** Ghi chú xử lý (vd: "Đã quy đổi 5 tạ → 500 kg") */
    @JsonProperty("processing_notes")
    private List<String> processingNotes;
}
