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
    List<BundlePledge> findByBundle_Id(UUID bundleId);
    List<BundlePledge> findByBundle_IdAndStatus(UUID bundleId, PledgeStatus status);
    List<BundlePledge> findByBundle_IdAndStatusIn(UUID bundleId, List<PledgeStatus> statuses);
    List<BundlePledge> findByFarmer_IdAndStatus(UUID farmerId, PledgeStatus status);
    Optional<BundlePledge> findByBundle_IdAndFarmer_Id(UUID bundleId, UUID farmerId);
    boolean existsByBundle_IdAndFarmer_Id(UUID bundleId, UUID farmerId);
    long countByFarmer_IdAndStatus(UUID farmerId, PledgeStatus status);
}
