package com.capnong.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Internal DTO — Request body gửi sang AI microservice.
 * Tách biệt khỏi FE request để có thể mở rộng thêm fields nội bộ
 * mà không ảnh hưởng contract với FE.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiVoiceRequest {
    private String transcript;
    private String language;
}
