package com.capnong.dto.response.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChartDataResponse {
    private String label; // "2026-04" hoặc "2026-04-19"
    private BigDecimal grossRevenue;
    private BigDecimal netRevenue;
}
