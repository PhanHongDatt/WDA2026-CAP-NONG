package com.capnong.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ShopResponseDto {
    private UUID id;
    private String slug;
    private String name;
    private String province;
    private String ward;
    private String bio;
    private Integer yearsExperience;
    private Integer farmAreaM2;
    private String avatarUrl;
    private String coverUrl;
    private UserSummaryDto owner;
    private HtxSummaryDto htx;
    private Float averageRating;
    private Integer totalReviews;
    private LocalDateTime createdAt;
}
