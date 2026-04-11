package com.capnong.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class HtxSummaryDto {
    private UUID id;
    private String name;
    private String province;
    private String status;
    private Integer totalMembers;
}
