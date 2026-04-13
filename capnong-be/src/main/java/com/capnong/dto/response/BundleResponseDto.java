package com.capnong.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class BundleResponseDto {
    private UUID id;
    private HtxShopInfo htxShop;
    private String productCategory;
    private String productName;
    private String unitCode;
    private BigDecimal targetQuantity;
    private BigDecimal currentPledgedQuantity;
    private BigDecimal progressPercent;
    private BigDecimal pricePerUnit;
    private LocalDate deadline;
    private String status;
    private String description;
    private BigDecimal minPledgeQuantity;
    private List<PledgeResponseDto> pledges;
    private OffsetDateTime createdAt;

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class HtxShopInfo {
        private UUID id;
        private String slug;
        private String name;
        private String description;
        private String avatarUrl;
        private HtxSummaryDto htx;
    }
}
