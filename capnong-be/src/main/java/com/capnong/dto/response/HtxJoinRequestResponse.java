package com.capnong.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
public class HtxJoinRequestResponse {
    private UUID id;
    private UUID htxId;
    private String htxName;
    private UUID farmerId;
    private String farmerUsername;
    private String farmerFullName;
    private String message;
    private String status;
    private String note;
    private LocalDateTime createdAt;
}
