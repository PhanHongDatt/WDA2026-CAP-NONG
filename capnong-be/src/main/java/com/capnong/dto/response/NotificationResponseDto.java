package com.capnong.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class NotificationResponseDto {
    private UUID id;
    private String type;
    private String title;
    private String body;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private Map<String, Object> metadata;
}
