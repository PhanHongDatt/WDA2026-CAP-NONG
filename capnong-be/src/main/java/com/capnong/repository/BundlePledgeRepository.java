package com.capnong.repository;

import com.capnong.model.BundlePledge;
import com.capnong.model.enums.PledgeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BundlePledgeRepository extends JpaRepository<BundlePledge, UUID> {
    List<BundlePledge> findByBundleId(UUID bundleId);
    List<BundlePledge> findByBundleIdAndStatus(UUID bundleId, PledgeStatus status);
    List<BundlePledge> findByFarmerIdAndStatus(UUID farmerId, PledgeStatus status);
    Optional<BundlePledge> findByBundleIdAndFarmerId(UUID bundleId, UUID farmerId);
    boolean existsByBundleIdAndFarmerId(UUID bundleId, UUID farmerId);
}
