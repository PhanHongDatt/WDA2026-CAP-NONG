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
public class AdminSummaryResponse {
    private long totalUsers;
    private long totalFarmers;
    private long totalBuyers;
    private long totalHtx;
    
    private BigDecimal globalGrossGMV; 
    private BigDecimal globalNetGMV;   
}
