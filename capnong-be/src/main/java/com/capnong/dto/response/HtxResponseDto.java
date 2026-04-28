package com.capnong.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class HtxResponseDto {
    private UUID id;
    private String name;
    private String province;
    private String status;
    private Integer totalMembers;
    private String officialCode;
    private String ward;
    private String description;
    private String documentUrl;
    private UserSummaryDto manager;
    private String htxShopSlug;
    private LocalDateTime createdAt;
}
