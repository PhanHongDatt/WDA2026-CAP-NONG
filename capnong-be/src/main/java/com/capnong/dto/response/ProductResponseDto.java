package com.capnong.dto.response;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ProductResponseDto {
    private UUID id;
    private String name;
    private String description;
    private String category;
    private UnitResponseDto unit;
    private Double pricePerUnit;
    private Double availableQuantity;
    private LocalDate harvestDate;
    private LocalDate availableFrom;
    private String farmingMethod;
    private Boolean pesticideFree;
    private String locationDetail;
    private String status;
    private List<String> images;
    private Float averageRating;
    private Integer totalReviews;
    private ShopResponseDto shop;
    private LocalDateTime createdAt;
}
