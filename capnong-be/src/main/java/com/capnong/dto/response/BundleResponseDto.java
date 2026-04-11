package com.capnong.dto.response;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class BundleResponseDto {
    private UUID id;
    private HtxShopResponseDto htxShop;
    private String productCategory;
    private String productName;
    private UnitResponseDto unit;
    private Double targetQuantity;
    private Double currentPledgedQuantity;
    private Double currentSoldQuantity;
    private Float progressPercent;
    private Double pricePerUnit;
    private LocalDate deadline;
    private String status;
    private List<PledgeResponseDto> pledges;
    private LocalDateTime createdAt;

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class HtxShopResponseDto {
        private UUID id;
        private String slug;
        private String name;
        private HtxSummaryDto htx;
        private String province;
        private String district;
        private String description;
        private String avatarUrl;
        private Integer activeBundlesCount;
        private LocalDateTime createdAt;
    }
}
