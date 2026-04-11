package com.capnong.controller;

import com.capnong.dto.response.ApiResponse;
import com.capnong.exception.AppException;
import com.capnong.model.Review;
import com.capnong.repository.ReviewRepository;
import com.capnong.security.UserDetailsImpl;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reviews")
public class ReviewController {

    private final ReviewRepository reviewRepository;

    public ReviewController(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<Page<Review>>> getProductReviews(
            @PathVariable UUID productId,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable);
        return ResponseEntity.ok(ApiResponse.success("OK", reviews));
    }

    @PostMapping
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<ApiResponse<Review>> createReview(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Review review) {
        if (reviewRepository.existsByOrderItemId(review.getOrderItemId())) {
            throw new AppException("Bạn đã đánh giá sản phẩm này rồi", HttpStatus.CONFLICT);
        }
        review.setAuthorId(userDetails.getId());
        Review saved = reviewRepository.save(review);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đánh giá thành công", saved));
    }

    @PostMapping("/{id}/reply")
    @PreAuthorize("hasAnyRole('FARMER','HTX_MEMBER','HTX_MANAGER')")
    public ResponseEntity<ApiResponse<Review>> replyReview(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy đánh giá", HttpStatus.NOT_FOUND));
        if (review.getSellerReply() != null) {
            throw new AppException("Bạn đã trả lời đánh giá này rồi", HttpStatus.CONFLICT);
        }
        review.setSellerReply(body.get("reply"));
        reviewRepository.save(review);
        return ResponseEntity.ok(ApiResponse.success("Đã phản hồi đánh giá", review));
    }
}
