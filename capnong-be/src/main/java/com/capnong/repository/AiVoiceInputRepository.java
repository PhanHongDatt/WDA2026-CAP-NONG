package com.capnong.repository;

import com.capnong.model.AiVoiceInput;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AiVoiceInputRepository extends JpaRepository<AiVoiceInput, UUID> {
    List<AiVoiceInput> findBySessionId(UUID sessionId);
}
