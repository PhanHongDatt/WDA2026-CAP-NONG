package com.capnong.repository;

import com.capnong.model.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShopRepository extends JpaRepository<Shop, UUID> {
    Optional<Shop> findBySlug(String slug);
    Optional<Shop> findFirstByOwnerUsername(String username);
    // Navigate via Shop.owner.id
    Optional<Shop> findFirstByOwner_Id(UUID ownerId);
    Optional<Shop> findFirstByOwner_IdAndIsHtxShop(UUID ownerId, boolean isHtxShop);
    java.util.List<Shop> findAllByOwner_Id(UUID ownerId);
    boolean existsByOwner_Id(UUID ownerId);
    boolean existsByOwner_IdAndIsHtxShop(UUID ownerId, boolean isHtxShop);
    boolean existsBySlug(String slug);
}
