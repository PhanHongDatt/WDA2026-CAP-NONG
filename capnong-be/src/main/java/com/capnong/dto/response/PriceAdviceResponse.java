package com.capnong.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class PriceAdviceResponse {
    private Long suggestedPrice;
    private Map<String, Long> priceRange;
    private String marketTrend;
    private String reasoning;
}
