package com.capnong.repository;

import com.capnong.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByUserId(Long userId);
    
    @Query("SELECT o FROM Order o WHERE (o.guestPhone = :phone OR o.guestEmail = :email) AND o.user IS NULL")
    List<Order> findUnmergedGuestOrders(@Param("phone") String phone, @Param("email") String email);
}
