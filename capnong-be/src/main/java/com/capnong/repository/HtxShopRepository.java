package com.capnong.repository;

import com.capnong.model.HtxShop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface HtxShopRepository extends JpaRepository<HtxShop, UUID> {
    Optional<HtxShop> findBySlug(String slug);
    Optional<HtxShop> findByHtxId(UUID htxId);
    boolean existsByHtxId(UUID htxId);
}
