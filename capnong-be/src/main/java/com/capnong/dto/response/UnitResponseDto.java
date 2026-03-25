package com.capnong.dto.response;

import lombok.*;
import java.util.List;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class UnitResponseDto {
    private String code;
    private String displayName;
    private String symbol;
    private String baseUnit;
    private Double conversionFactor;
    private String category;
    private List<String> aliases;
}
