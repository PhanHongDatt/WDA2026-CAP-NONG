package com.capnong.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ShopCreateRequest {

    @NotBlank(message = "Tên vườn/gian hàng không được để trống")
    @Size(max = 255, message = "Tên vườn tối đa 255 ký tự")
    private String name;

    @NotBlank(message = "Slug không được để trống")
    @Size(max = 100, message = "Slug tối đa 100 ký tự")
    @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug chỉ chứa chữ cái thường, số và dấu gạch ngang")
    private String slug;

    @NotBlank(message = "Tỉnh/Thành phố không được để trống")
    @Size(max = 100)
    private String province;

    @NotBlank(message = "Quận/Huyện không được để trống")
    @Size(max = 100)
    private String district;

    // --- Tùy chọn ---

    private String bio;

    @Min(value = 0, message = "Số năm kinh nghiệm phải >= 0")
    private Short yearsExperience;

    @Min(value = 0, message = "Diện tích vườn phải >= 0")
    private Integer farmAreaM2;

    private String avatarUrl;

    private String coverUrl;
}