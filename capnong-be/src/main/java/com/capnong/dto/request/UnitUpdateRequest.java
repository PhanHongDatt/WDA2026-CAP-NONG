package com.capnong.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class UnitUpdateRequest {
    @NotBlank(message = "Tên hiển thị không được để trống")
    private String displayName;

    @NotBlank(message = "Ký hiệu không được để trống")
    private String symbol;

    private String baseUnitCode;

    @NotNull(message = "Hệ số quy đổi không được để trống")
    private BigDecimal conversionFactor;

    @NotBlank(message = "Danh mục không được để trống (WEIGHT, VOLUME, COUNT, PACKAGING)")
    private String category;

    private List<String> aliases;
}
