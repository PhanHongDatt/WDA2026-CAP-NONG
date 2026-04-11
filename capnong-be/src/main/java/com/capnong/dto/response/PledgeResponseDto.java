package com.capnong.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class PledgeResponseDto {
    private UUID id;
    private UserSummaryDto farmer;
    private BigDecimal quantity;
    private BigDecimal contributionPercent;
    private BigDecimal estimatedRevenue;
    private String status;
    private String note;
    private OffsetDateTime createdAt;
}
