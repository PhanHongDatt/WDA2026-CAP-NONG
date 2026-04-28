package com.capnong.repository;

import com.capnong.model.HtxJoinRequest;
import com.capnong.model.enums.JoinRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HtxJoinRequestRepository extends JpaRepository<HtxJoinRequest, UUID> {
    List<HtxJoinRequest> findByHtx_IdAndStatus(UUID htxId, JoinRequestStatus status);
    List<HtxJoinRequest> findByHtx_Id(UUID htxId);
    Optional<HtxJoinRequest> findByFarmer_IdAndHtx_IdAndStatus(UUID farmerId, UUID htxId, JoinRequestStatus status);
    boolean existsByFarmer_IdAndStatus(UUID farmerId, JoinRequestStatus status);
    List<HtxJoinRequest> findByFarmer_Id(UUID farmerId);
}
