package com.capnong.repository;

import com.capnong.model.AiListingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AiListingSessionRepository extends JpaRepository<AiListingSession, UUID> {
    List<AiListingSession> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
