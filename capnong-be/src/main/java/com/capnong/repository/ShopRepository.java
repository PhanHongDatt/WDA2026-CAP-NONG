package com.capnong.repository;

import com.capnong.model.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShopRepository extends JpaRepository<Shop, UUID> {
    Optional<Shop> findBySlug(String slug);
    Optional<Shop> findByOwnerId(UUID ownerId);
    boolean existsBySlug(String slug);
    boolean existsByOwnerId(UUID ownerId);
}
