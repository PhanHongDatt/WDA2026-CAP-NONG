package com.capnong.repository;

import com.capnong.model.SubOrder;
import com.capnong.model.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubOrderRepository extends JpaRepository<SubOrder, UUID> {
    List<SubOrder> findByOrderId(UUID orderId);
    List<SubOrder> findByShop_IdAndStatusOrderByCreatedAtDesc(UUID shopId, OrderStatus status);
    List<SubOrder> findByShop_IdOrderByCreatedAtDesc(UUID shopId);
    Optional<SubOrder> findByIdAndShop_Owner_Id(UUID subOrderId, UUID ownerId);

    // Paginated versions for seller dashboard
    Page<SubOrder> findByShop_IdAndStatusOrderByCreatedAtDesc(UUID shopId, OrderStatus status, Pageable pageable);
    Page<SubOrder> findByShop_IdOrderByCreatedAtDesc(UUID shopId, Pageable pageable);

    // Dashboard - Farmer
    @Query("SELECT COUNT(s) FROM SubOrder s WHERE s.shop.owner.username = :username")
    long countOrdersByFarmerUsername(@Param("username") String username);

    @Query("SELECT COUNT(s) FROM SubOrder s WHERE s.shop.owner.username = :username AND s.status IN ('PENDING', 'PROCESSING', 'SHIPPED')")
    long countPendingOrdersByFarmerUsername(@Param("username") String username);

    @Query("SELECT COALESCE(SUM(s.subTotal + s.shippingFee), 0) FROM SubOrder s WHERE s.shop.owner.username = :username")
    java.math.BigDecimal calculateGrossRevenueByFarmerUsername(@Param("username") String username);

    @Query("SELECT COALESCE(SUM(s.subTotal + s.shippingFee), 0) FROM SubOrder s WHERE s.shop.owner.username = :username AND s.status = 'COMPLETED'")
    java.math.BigDecimal calculateNetRevenueByFarmerUsername(@Param("username") String username);

    // Dashboard - HTX Manager
    @Query("SELECT COUNT(s) FROM SubOrder s WHERE s.shop.owner.htx.id = :htxId")
    long countOrdersByHtxId(@Param("htxId") UUID htxId);

    @Query("SELECT COALESCE(SUM(s.subTotal + s.shippingFee), 0) FROM SubOrder s WHERE s.shop.owner.htx.id = :htxId")
    java.math.BigDecimal calculateMemberRetailGrossRevenueByHtxId(@Param("htxId") UUID htxId);

    @Query("SELECT COALESCE(SUM(s.subTotal + s.shippingFee), 0) FROM SubOrder s WHERE s.shop.owner.htx.id = :htxId AND s.status = 'COMPLETED'")
    java.math.BigDecimal calculateMemberRetailNetRevenueByHtxId(@Param("htxId") UUID htxId);
}

