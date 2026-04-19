package com.capnong.service.impl;

import com.capnong.dto.response.dashboard.AdminSummaryResponse;
import com.capnong.dto.response.dashboard.BuyerSummaryResponse;
import com.capnong.dto.response.dashboard.FarmerSummaryResponse;
import com.capnong.dto.response.dashboard.HtxSummaryResponse;
import com.capnong.exception.AppException;
import com.capnong.exception.ResourceNotFoundException;
import com.capnong.model.Htx;
import com.capnong.model.User;
import com.capnong.model.enums.HtxStatus;
import com.capnong.model.enums.Role;
import com.capnong.repository.HtxRepository;
import com.capnong.repository.OrderRepository;
import com.capnong.repository.SubOrderRepository;
import com.capnong.repository.UserRepository;
import com.capnong.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final OrderRepository orderRepository;
    private final SubOrderRepository subOrderRepository;
    private final UserRepository userRepository;
    private final HtxRepository htxRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "dashboard_buyer", key = "#username")
    public BuyerSummaryResponse getBuyerSummary(String username) {
        if (!userRepository.existsByUsername(username)) {
            throw new ResourceNotFoundException("User", "username", username);
        }

        return BuyerSummaryResponse.builder()
                .totalOrders(orderRepository.countOrdersByBuyerUsername(username))
                .pendingOrders(orderRepository.countPendingOrdersByBuyerUsername(username))
                .grossRevenue(orderRepository.calculateGrossRevenueByBuyerUsername(username))
                .netRevenue(orderRepository.calculateNetRevenueByBuyerUsername(username))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "dashboard_farmer", key = "#username")
    public FarmerSummaryResponse getFarmerSummary(String username) {
        if (!userRepository.existsByUsername(username)) {
            throw new ResourceNotFoundException("User", "username", username);
        }

        return FarmerSummaryResponse.builder()
                .totalOrders(subOrderRepository.countOrdersByFarmerUsername(username))
                .pendingOrders(subOrderRepository.countPendingOrdersByFarmerUsername(username))
                .outOfStockProducts(0) // Will implement product counting if needed
                .grossRevenue(subOrderRepository.calculateGrossRevenueByFarmerUsername(username))
                .netRevenue(subOrderRepository.calculateNetRevenueByFarmerUsername(username))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "dashboard_htx", key = "#username")
    public HtxSummaryResponse getHtxSummary(String username) {
        User manager = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Htx htx = htxRepository.findByManager_Id(manager.getId())
                .orElseThrow(() -> new AppException("Bạn chưa quản lý HTX nào", HttpStatus.NOT_FOUND));

        BigDecimal memberRetailGross = subOrderRepository.calculateMemberRetailGrossRevenueByHtxId(htx.getId());
        BigDecimal memberRetailNet = subOrderRepository.calculateMemberRetailNetRevenueByHtxId(htx.getId());
        BigDecimal wholesaleGross = BigDecimal.ZERO; // Future wholesale aggregation
        BigDecimal wholesaleNet = BigDecimal.ZERO;

        return HtxSummaryResponse.builder()
                .totalMembers(userRepository.countMembersByHtxId(htx.getId()))
                .totalOrders(subOrderRepository.countOrdersByHtxId(htx.getId()))
                .totalMemberRetailRevenue(memberRetailGross)
                .totalWholesaleRevenue(wholesaleGross) // Placeholder
                .grossRevenue(memberRetailGross.add(wholesaleGross))
                .netRevenue(memberRetailNet.add(wholesaleNet))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "dashboard_admin")
    public AdminSummaryResponse getAdminSummary() {
        return AdminSummaryResponse.builder()
                .totalUsers(userRepository.countAllUsers())
                .totalFarmers(userRepository.countUsersByRole(Role.FARMER))
                .totalBuyers(userRepository.countUsersByRole(Role.BUYER))
                .totalHtx(htxRepository.countByStatus(HtxStatus.ACTIVE))
                .globalGrossGMV(orderRepository.calculateGlobalGrossGMV())
                .globalNetGMV(orderRepository.calculateGlobalNetGMV())
                .build();
    }
}
