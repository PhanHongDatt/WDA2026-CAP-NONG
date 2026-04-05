package com.capnong.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Mỗi field trong kết quả trích xuất đi kèm confidence score.
 *
 * <p>Confidence levels:
 * <ul>
 *   <li><b>high</b> (≥ 0.85): Hiển thị bình thường</li>
 *   <li><b>medium</b> (0.70–0.84): Gạch chân vàng, gợi ý kiểm tra</li>
 *   <li><b>low</b> (&lt; 0.70): Highlight đỏ, yêu cầu xác nhận</li>
 * </ul>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FieldWithConfidence {

    /** Giá trị trích xuất (String, Number, hoặc null) */
    private Object value;

    /** Confidence score từ AI (0.0 – 1.0) */
    private Double confidence;

    /** Mức confidence đã phân loại: "high", "medium", "low" */
    @JsonProperty("confidence_level")
    private String confidenceLevel;

    /** Giá trị gốc trước khi quy đổi đơn vị (nếu có) */
    @JsonProperty("raw_value")
    private String rawValue;
}
