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
import com.capnong.repository.*;
import com.capnong.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final OrderRepository orderRepository;
    private final SubOrderRepository subOrderRepository;
    private final UserRepository userRepository;
    private final HtxRepository htxRepository;
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;

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

        // Rating stats
        Object[] ratingStats = reviewRepository.getShopRatingStatsByOwnerUsername(username);
        double avgRating = 0;
        long totalReviews = 0;

        if (ratingStats != null && ratingStats.length > 0) {
            Object avgObj;
            Object countObj;
            if (ratingStats[0] instanceof Object[]) {
                Object[] row = (Object[]) ratingStats[0];
                avgObj = row[0];
                countObj = row[1];
            } else if (ratingStats.length >= 2) {
                avgObj = ratingStats[0];
                countObj = ratingStats[1];
            } else {
                avgObj = null;
                countObj = null;
            }

            if (avgObj != null && countObj != null) {
                avgRating = ((Number) avgObj).doubleValue();
                totalReviews = ((Number) countObj).longValue();
            }
        }

        return FarmerSummaryResponse.builder()
                .totalOrders(subOrderRepository.countOrdersByFarmerUsername(username))
                .pendingOrders(subOrderRepository.countPendingOrdersByFarmerUsername(username))
                .totalProducts(productRepository.countActiveByShopOwnerUsername(username))
                .outOfStockProducts(0)
                .grossRevenue(subOrderRepository.calculateGrossRevenueByFarmerUsername(username))
                .netRevenue(subOrderRepository.calculateNetRevenueByFarmerUsername(username))
                .averageRating(Math.round(avgRating * 10.0) / 10.0)
                .totalReviews(totalReviews)
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
        BigDecimal wholesaleGross = BigDecimal.ZERO;
        BigDecimal wholesaleNet = BigDecimal.ZERO;

        return HtxSummaryResponse.builder()
                .totalMembers(userRepository.countMembersByHtxId(htx.getId()))
                .totalOrders(subOrderRepository.countOrdersByHtxId(htx.getId()))
                .totalMemberRetailRevenue(memberRetailGross)
                .totalWholesaleRevenue(wholesaleGross)
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

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMonthlyRevenue(String username, int year) {
        if (!userRepository.existsByUsername(username)) {
            throw new ResourceNotFoundException("User", "username", username);
        }

        List<Object[]> rawData = subOrderRepository.getMonthlyRevenueByFarmerUsername(username, year);

        // Build a full 12-month result (fill missing months with 0)
        Map<Integer, BigDecimal> monthMap = new LinkedHashMap<>();
        for (Object[] row : rawData) {
            int month = ((Number) row[0]).intValue();
            BigDecimal revenue = (BigDecimal) row[1];
            monthMap.put(month, revenue);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        String[] monthLabels = {"T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"};
        for (int m = 1; m <= 12; m++) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("month", m);
            entry.put("label", monthLabels[m - 1]);
            entry.put("revenue", monthMap.getOrDefault(m, BigDecimal.ZERO));
            result.add(entry);
        }
        return result;
    }
}
