package com.capnong.controller;

import com.capnong.dto.response.ApiResponse;
import com.capnong.dto.response.dashboard.AdminSummaryResponse;
import com.capnong.dto.response.dashboard.BuyerSummaryResponse;
import com.capnong.dto.response.dashboard.FarmerSummaryResponse;
import com.capnong.dto.response.dashboard.HtxSummaryResponse;
import com.capnong.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboards")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "APIs for reporting and dashboard aggregation")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/buyer/summary")
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Get buyer dashboard summary")
    public ResponseEntity<ApiResponse<BuyerSummaryResponse>> getBuyerSummary(Authentication authentication) {
        String username = ((UserDetails) authentication.getPrincipal()).getUsername();
        return ResponseEntity.ok(ApiResponse.success("Success", dashboardService.getBuyerSummary(username)));
    }

    @GetMapping("/farmer/summary")
    @PreAuthorize("hasAnyRole('FARMER', 'HTX_MEMBER', 'HTX_MANAGER')")
    @Operation(summary = "Get farmer/seller dashboard summary")
    public ResponseEntity<ApiResponse<FarmerSummaryResponse>> getFarmerSummary(Authentication authentication) {
        String username = ((UserDetails) authentication.getPrincipal()).getUsername();
        return ResponseEntity.ok(ApiResponse.success("Success", dashboardService.getFarmerSummary(username)));
    }

    @GetMapping("/htx/summary")
    @PreAuthorize("hasRole('HTX_MANAGER')")
    @Operation(summary = "Get cooperative manager dashboard summary")
    public ResponseEntity<ApiResponse<HtxSummaryResponse>> getHtxSummary(Authentication authentication) {
        String username = ((UserDetails) authentication.getPrincipal()).getUsername();
        return ResponseEntity.ok(ApiResponse.success("Success", dashboardService.getHtxSummary(username)));
    }

    @GetMapping("/admin/summary")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get global admin dashboard summary")
    public ResponseEntity<ApiResponse<AdminSummaryResponse>> getAdminSummary() {
        return ResponseEntity.ok(ApiResponse.success("Success", dashboardService.getAdminSummary()));
    }

    @GetMapping("/farmer/monthly-revenue")
    @PreAuthorize("hasAnyRole('FARMER', 'HTX_MEMBER', 'HTX_MANAGER')")
    @Operation(summary = "Get farmer monthly revenue for chart (12 months)")
    public ResponseEntity<ApiResponse<java.util.List<java.util.Map<String, Object>>>> getMonthlyRevenue(
            Authentication authentication,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "0") int year) {
        String username = ((UserDetails) authentication.getPrincipal()).getUsername();
        if (year <= 0) year = java.time.Year.now().getValue();
        return ResponseEntity.ok(ApiResponse.success("Success", dashboardService.getMonthlyRevenue(username, year)));
    }
}
