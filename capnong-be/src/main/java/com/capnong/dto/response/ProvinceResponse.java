package com.capnong.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ProvinceResponse {
    private Integer code;
    private String name;
    private String codename;
    private String divisionType;
    private List<WardResponse> wards;
}
