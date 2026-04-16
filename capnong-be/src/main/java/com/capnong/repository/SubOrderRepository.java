package com.capnong.repository;

import com.capnong.model.SubOrder;
import com.capnong.model.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

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
}
