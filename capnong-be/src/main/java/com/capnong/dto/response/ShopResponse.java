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
public class ShopResponse {

    private UUID id;
    private String slug;
    private String name;
    private String province;
    private String district;
    private String bio;
    private Short yearsExperience;
    private Integer farmAreaM2;
    private String avatarUrl;
    private String coverUrl;
    private BigDecimal averageRating;
    private Integer totalReviews;
    private LocalDateTime createdAt;

    // Owner info (safe subset)
    private UUID ownerId;
    private String ownerUsername;
    private String ownerFullName;
    private String ownerAvatarUrl;
}
