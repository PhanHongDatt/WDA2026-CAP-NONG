package com.capnong.repository;

import com.capnong.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    Page<Review> findByProductIdOrderByCreatedAtDesc(UUID productId, Pageable pageable);
    Optional<Review> findByOrderItemId(UUID orderItemId);
    boolean existsByOrderItemId(UUID orderItemId);
    boolean existsByAuthorIdAndOrderItemId(UUID authorId, UUID orderItemId);
}
