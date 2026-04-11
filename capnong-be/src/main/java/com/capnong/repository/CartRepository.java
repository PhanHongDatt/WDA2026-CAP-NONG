package com.capnong.repository;

import com.capnong.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartRepository extends JpaRepository<Cart, UUID> {
    Optional<Cart> findByGuestSessionId(String guestSessionId);
    Optional<Cart> findByUser_Id(UUID userId);
    void deleteByUser_Id(UUID userId);
}
