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
public class FarmerSummaryResponse {
    private long totalOrders;
    private long pendingOrders;
    private long totalProducts;
    private long outOfStockProducts;
    
    private BigDecimal grossRevenue; 
    private BigDecimal netRevenue;
    
    private double averageRating;
    private long totalReviews;
}
