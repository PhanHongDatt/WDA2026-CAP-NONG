package com.capnong.repository;

import com.capnong.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    Page<Review> findByProductIdOrderByCreatedAtDesc(UUID productId, Pageable pageable);
    Optional<Review> findByOrderItemId(UUID orderItemId);
    boolean existsByOrderItemId(UUID orderItemId);
    boolean existsByAuthorIdAndOrderItemId(UUID authorId, UUID orderItemId);

    @Query("SELECT AVG(r.rating), COUNT(r) FROM Review r WHERE r.productId = :productId")
    Object[] getProductRatingStats(@Param("productId") UUID productId);

    // Buyer: xem đánh giá của chính mình
    Page<Review> findByAuthorIdOrderByCreatedAtDesc(UUID authorId, Pageable pageable);

    // Seller: xem tất cả đánh giá về sản phẩm của shop mình
    @Query("SELECT r FROM Review r WHERE r.productId IN (SELECT p.id FROM Product p WHERE p.shop.owner.username = :username)")
    Page<Review> findByShopOwnerUsernameOrderByCreatedAtDesc(@Param("username") String username, Pageable pageable);
}
