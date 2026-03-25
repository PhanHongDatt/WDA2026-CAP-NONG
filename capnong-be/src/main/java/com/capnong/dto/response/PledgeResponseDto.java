package com.capnong.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class PledgeResponseDto {
    private UUID id;
    private UserSummaryDto farmer;
    private Double quantity;
    private UnitResponseDto unit;
    private Float contributionPercent;
    private Double estimatedRevenue;
    private String status;
    private LocalDateTime createdAt;
}
