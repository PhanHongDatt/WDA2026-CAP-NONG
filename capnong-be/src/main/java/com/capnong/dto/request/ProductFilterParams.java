package com.capnong.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Filter params cho Product search.
 * Tất cả đều optional — FE gửi param nào thì filter đó.
 */
@Data
public class ProductFilterParams {
    private String keyword;            // LIKE trên name + description
    private String category;           // FRUIT, VEGETABLE, ...
    private String province;           // province của shop
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private String farmingMethod;      // ORGANIC, VIETGAP, ...
    private String status;             // IN_SEASON, UPCOMING, ...
    private Boolean pesticideFree;
    private UUID shopId;               // filter theo shop cụ thể
    private String shopSlug;           // filter theo shop slug
}
