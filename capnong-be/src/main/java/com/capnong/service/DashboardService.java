package com.capnong.service;

import com.capnong.dto.response.dashboard.AdminSummaryResponse;
import com.capnong.dto.response.dashboard.BuyerSummaryResponse;
import com.capnong.dto.response.dashboard.FarmerSummaryResponse;
import com.capnong.dto.response.dashboard.HtxSummaryResponse;

public interface DashboardService {
    BuyerSummaryResponse getBuyerSummary(String username);
    FarmerSummaryResponse getFarmerSummary(String username);
    HtxSummaryResponse getHtxSummary(String username);
    AdminSummaryResponse getAdminSummary();
    java.util.List<java.util.Map<String, Object>> getMonthlyRevenue(String username, int year);
}
