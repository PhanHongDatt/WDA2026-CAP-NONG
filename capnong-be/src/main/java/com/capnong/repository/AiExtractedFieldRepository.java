package com.capnong.repository;

import com.capnong.model.AiExtractedField;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AiExtractedFieldRepository extends JpaRepository<AiExtractedField, UUID> {
    List<AiExtractedField> findBySessionId(UUID sessionId);
}
