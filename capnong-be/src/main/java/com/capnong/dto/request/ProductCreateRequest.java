package com.capnong.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ProductCreateRequest {
    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;

    private String description;

    @NotBlank(message = "Danh mục không được để trống")
    private String category;

    @NotBlank(message = "Đơn vị tính không được để trống")
    private String unitCode;

    @NotNull(message = "Giá không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá phải lớn hơn 0")
    private BigDecimal pricePerUnit;

    @NotNull(message = "Sản lượng không được để trống")
    @DecimalMin(value = "0.0", message = "Sản lượng không hợp lệ")
    private BigDecimal availableQuantity;

    @NotBlank(message = "Địa chỉ canh tác không được để trống")
    private String locationDetail;

    // New fields
    private LocalDate harvestDate;
    private LocalDate availableFrom;
    private String farmingMethod;    // TRADITIONAL, ORGANIC, VIETGAP, GLOBALGAP
    private Boolean pesticideFree;

    // Optional nice-to-have fields
    private BigDecimal minOrderQuantity;
    private BigDecimal weight;
    private String origin;
    private String shelfLife;
}