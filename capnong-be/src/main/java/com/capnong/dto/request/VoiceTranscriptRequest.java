package com.capnong.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request từ FE — Transcript giọng nói cần trích xuất thông tin sản phẩm.
 *
 * <p>Validation rules:
 * <ul>
 *   <li>transcript: bắt buộc, 5–2000 ký tự (khớp với AI service schema)</li>
 *   <li>language: BCP-47 format, default "vi-VN"</li>
 * </ul>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VoiceTranscriptRequest {

    @NotBlank(message = "Transcript không được để trống")
    @Size(min = 5, max = 2000, message = "Transcript phải từ 5 đến 2000 ký tự")
    private String transcript;

    @Pattern(regexp = "^[a-z]{2}-[A-Z]{2}$", message = "Language phải theo format BCP-47, ví dụ: vi-VN")
    private String language = "vi-VN";
}
