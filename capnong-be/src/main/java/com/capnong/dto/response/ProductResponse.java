package com.capnong.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private UUID id;
    private String name;
    private String description;
    private String category;
    private String unitCode;
    private String unitName;
    private BigDecimal pricePerUnit;
    private BigDecimal availableQuantity;
    private String locationDetail;
    private String status;
    private LocalDateTime createdAt;

    // Domain-specific
    private LocalDate harvestDate;
    private LocalDate availableFrom;
    private String farmingMethod;
    private Boolean pesticideFree;
    private BigDecimal minOrderQuantity;
    private BigDecimal weight;
    private String origin;
    private String shelfLife;
    private BigDecimal averageRating;
    private Integer totalReviews;
    private Integer totalSold;

    // Images
    private List<ProductImageResponse> images;

    // Shop info
    private UUID shopId;
    private String shopSlug;
    private String shopName;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductImageResponse {
        private UUID id;
        private String url;
        private Short sortOrder;
    }
}
