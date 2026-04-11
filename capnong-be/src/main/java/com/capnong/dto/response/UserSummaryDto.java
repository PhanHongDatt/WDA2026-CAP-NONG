package com.capnong.dto.response;

import lombok.*;
import java.util.UUID;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class UserSummaryDto {
    private UUID id;
    private String fullName;
    private String phone;
    private String role;
    private String avatarUrl;
    private String shopSlug;
}
