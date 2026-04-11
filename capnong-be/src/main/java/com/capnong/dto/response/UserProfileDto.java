package com.capnong.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class UserProfileDto {
    private UUID id;
    private String fullName;
    private String phone;
    private String role;
    private String avatarUrl;
    private String shopSlug;
    private String email;
    private LocalDateTime createdAt;
    private UUID htxId;
    private String htxName;
    private Boolean isBanned;
}
