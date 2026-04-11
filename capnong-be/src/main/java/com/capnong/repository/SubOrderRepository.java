package com.capnong.repository;

import com.capnong.model.SubOrder;
import com.capnong.model.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SubOrderRepository extends JpaRepository<SubOrder, UUID> {
    List<SubOrder> findByOrderId(UUID orderId);
    List<SubOrder> findByShopIdAndStatusOrderByCreatedAtDesc(UUID shopId, OrderStatus status);
    List<SubOrder> findByShopIdOrderByCreatedAtDesc(UUID shopId);
}
