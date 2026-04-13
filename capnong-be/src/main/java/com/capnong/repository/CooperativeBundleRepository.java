package com.capnong.repository;

import com.capnong.model.CooperativeBundle;
import com.capnong.model.enums.BundleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface CooperativeBundleRepository extends JpaRepository<CooperativeBundle, UUID> {
    List<CooperativeBundle> findByHtxShop_Id(UUID htxShopId);
    List<CooperativeBundle> findByHtxShop_IdAndStatus(UUID htxShopId, BundleStatus status);
    List<CooperativeBundle> findByHtxShop_IdOrderByCreatedAtDesc(UUID htxShopId);
    List<CooperativeBundle> findByStatus(BundleStatus status);
    List<CooperativeBundle> findByStatusInAndDeadlineBefore(List<BundleStatus> statuses, LocalDate date);
}
