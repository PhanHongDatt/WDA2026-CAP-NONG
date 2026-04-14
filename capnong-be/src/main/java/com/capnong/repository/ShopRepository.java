package com.capnong.repository;

import com.capnong.model.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShopRepository extends JpaRepository<Shop, UUID> {
    Optional<Shop> findBySlug(String slug);
    Optional<Shop> findByOwnerUsername(String username);
    // Navigate via Shop.owner.id
    Optional<Shop> findByOwner_Id(UUID ownerId);
    boolean existsByOwner_Id(UUID ownerId);
    boolean existsBySlug(String slug);
}
