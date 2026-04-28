package com.capnong.repository;

import com.capnong.model.CooperativeBundle;
import com.capnong.model.enums.BundleStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CooperativeBundleRepository extends JpaRepository<CooperativeBundle, UUID> {
    List<CooperativeBundle> findByHtxShop_Id(UUID htxShopId);
    List<CooperativeBundle> findByHtxShop_IdAndStatus(UUID htxShopId, BundleStatus status);

    @EntityGraph(attributePaths = {"pledges", "pledges.farmer"})
    List<CooperativeBundle> findByHtxShop_IdOrderByCreatedAtDesc(UUID htxShopId);

    @EntityGraph(attributePaths = {"pledges", "pledges.farmer"})
    List<CooperativeBundle> findByHtxShop_Shop_IdOrderByCreatedAtDesc(UUID shopId);

    @EntityGraph(attributePaths = {"pledges", "pledges.farmer"})
    List<CooperativeBundle> findByStatus(BundleStatus status);

    @EntityGraph(attributePaths = {"pledges", "pledges.farmer"})
    List<CooperativeBundle> findByHtxShop_Htx_IdOrderByCreatedAtDesc(UUID htxId);

    List<CooperativeBundle> findByStatusInAndDeadlineBefore(List<BundleStatus> statuses, LocalDate date);

    @EntityGraph(attributePaths = {"pledges", "pledges.farmer"})
    Optional<CooperativeBundle> findById(UUID id);
}
