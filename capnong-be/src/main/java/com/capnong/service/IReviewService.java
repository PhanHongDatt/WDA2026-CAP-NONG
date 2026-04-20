package com.capnong.service;

import com.capnong.dto.request.ReviewCreateRequest;
import com.capnong.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface IReviewService {
    Page<Review> getByProductId(UUID productId, Pageable pageable);
    Review createReview(UUID authorId, ReviewCreateRequest request);
    Review addSellerReply(UUID reviewId, UUID sellerId, String reply);

    // /me routes
    Page<Review> getMyReviews(UUID authorId, Pageable pageable);
    Page<Review> getShopReviews(String sellerUsername, Pageable pageable);
}
