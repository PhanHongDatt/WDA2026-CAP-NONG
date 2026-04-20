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
public class HtxSummaryResponse {
    private long totalMembers;
    private long totalOrders;
    
    private BigDecimal totalMemberRetailRevenue;   
    private BigDecimal totalWholesaleRevenue;      
    private BigDecimal grossRevenue; 
    private BigDecimal netRevenue;   
}
