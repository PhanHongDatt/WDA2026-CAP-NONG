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
public class BuyerSummaryResponse {
    private long totalOrders;
    private long pendingOrders;
    
    private BigDecimal grossRevenue; // Tổng chi tiêu
    private BigDecimal netRevenue;   // Chi tiêu thực tế (không tính huỷ)
}
