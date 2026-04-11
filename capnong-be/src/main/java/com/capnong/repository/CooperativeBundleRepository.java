package com.capnong.repository;

import com.capnong.model.CooperativeBundle;
import com.capnong.model.enums.BundleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CooperativeBundleRepository extends JpaRepository<CooperativeBundle, UUID> {
    List<CooperativeBundle> findByHtxShopId(UUID htxShopId);
    List<CooperativeBundle> findByHtxShopIdAndStatus(UUID htxShopId, BundleStatus status);
    List<CooperativeBundle> findByStatus(BundleStatus status);
}
