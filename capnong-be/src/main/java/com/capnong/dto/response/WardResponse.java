package com.capnong.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WardResponse {
    private Integer code;
    private String name;
    private String codename;
    private String divisionType;
}
