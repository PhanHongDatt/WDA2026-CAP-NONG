package com.capnong.repository;

import com.capnong.model.Order;
import com.capnong.model.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    List<Order> findByUser_Id(UUID userId);

    Page<Order> findByUser_IdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    Page<Order> findByUser_IdAndStatusOrderByCreatedAtDesc(UUID userId, OrderStatus status, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE (o.guestPhone = :phone OR o.guestEmail = :email) AND o.user IS NULL")
    List<Order> findByUser_IdOrderByCreatedAtDesc(UUID userId);

    Optional<Order> findByOrderNumber(String orderNumber);

    Optional<Order> findByOrderNumberAndGuestPhone(String orderNumber, String guestPhone);

    @Query("SELECT o FROM Order o WHERE (o.guestPhone = :phone OR o.guestEmail = :email) AND o.user IS NULL AND o.isMerged = false")
    List<Order> findUnmergedGuestOrders(@Param("phone") String phone, @Param("email") String email);
}
