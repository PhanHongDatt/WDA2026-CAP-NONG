package com.capnong.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
public class ProductResponse {
    private UUID id;
    private String name;
    private String description;
    private String category;
    private String unitCode;
    private BigDecimal pricePerUnit;
    private BigDecimal availableQuantity;
    private String locationDetail;
    private String status;
    private LocalDateTime createdAt;

    // Shop info
    private UUID shopId;
    private String shopSlug;
    private String shopName;
}
