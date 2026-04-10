// src/main/java/com/capnong/dto/request/ShopCreateRequest.java
package com.capnong.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ShopCreateRequest {
    @NotBlank(message = "Tên gian hàng không được để trống")
    private String name;

    @NotBlank(message = "Slug không được để trống")
    @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug chỉ chứa chữ cái thường, số và dấu gạch ngang")
    private String slug;

    @NotBlank(message = "Tỉnh/Thành phố không được để trống")
    private String province;

    @NotBlank(message = "Quận/Huyện không được để trống")
    private String district;

    private String bio;
}