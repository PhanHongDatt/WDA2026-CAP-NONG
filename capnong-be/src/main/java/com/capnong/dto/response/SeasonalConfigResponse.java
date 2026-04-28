package com.capnong.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeasonalConfigResponse {
    private UUID id;
    private String province;
    private String productCategory;
    private Short startMonth;
    private Short endMonth;
    private String configuredBy;
    private UUID configuredByUserId;
    private String configuredByUsername;
    private String note;
    private LocalDateTime updatedAt;
}
