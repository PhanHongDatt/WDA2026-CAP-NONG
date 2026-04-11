package com.capnong.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
public class UnitResponse {
    private UUID id;
    private String code;
    private String displayName;
    private String symbol;
    private String baseUnitCode;
    private BigDecimal conversionFactor;
    private String category;
    private List<String> aliases;
}
