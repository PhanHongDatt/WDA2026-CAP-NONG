package com.capnong.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
public class HtxResponse {
    private UUID id;
    private String name;
    private String officialCode;
    private String province;
    private String district;
    private String description;
    private String documentUrl;
    private String status;
    private String adminNote;
    private LocalDateTime createdAt;

    // Manager info
    private UUID managerId;
    private String managerUsername;
    private String managerFullName;

    // Creator info
    private UUID createdByUserId;
    private String createdByUsername;
}
