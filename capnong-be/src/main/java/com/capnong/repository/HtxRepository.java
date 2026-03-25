package com.capnong.repository;

import com.capnong.model.Htx;
import com.capnong.model.enums.HtxStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HtxRepository extends JpaRepository<Htx, UUID> {
    Optional<Htx> findByOfficialCode(String officialCode);
    List<Htx> findByStatus(HtxStatus status);
    List<Htx> findByManagerId(UUID managerId);
    List<Htx> findByProvince(String province);
    boolean existsByOfficialCode(String officialCode);
}
