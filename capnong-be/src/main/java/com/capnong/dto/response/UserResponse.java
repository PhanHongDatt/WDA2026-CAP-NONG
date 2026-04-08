package com.capnong.dto.response;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class UserResponse {

    private UUID id;
    private String username;
    private String phone;
    private String email;
    private String fullName;
    private String avatarUrl;
    private String role;
    private Boolean active;
    private LocalDateTime createdAt;
}
