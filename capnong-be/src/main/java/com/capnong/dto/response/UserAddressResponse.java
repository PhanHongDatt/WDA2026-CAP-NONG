package com.capnong.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
public class UserAddressResponse {
    private UUID id;
    private String fullName;
    private String phone;
    private String street;
    private String district;
    private String province;
    private Boolean isDefault;
    private OffsetDateTime createdAt;
}
