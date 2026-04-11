package com.capnong.repository;

import com.capnong.model.AiRefineSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AiRefineSessionRepository extends JpaRepository<AiRefineSession, UUID> {
    List<AiRefineSession> findBySessionId(UUID sessionId);
}
