package com.capnong.controller;

import com.capnong.dto.request.ReviewCreateRequest;
import com.capnong.dto.response.ApiResponse;
import com.capnong.model.Review;
import com.capnong.security.UserDetailsImpl;
import com.capnong.service.ReviewService;
import jakarta.validation.Valid;
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
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    /**
     * GET /api/reviews/product/{productId} — Lấy đánh giá của sản phẩm (public).
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<Page<Review>>> getProductReviews(
            @PathVariable UUID productId,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<Review> reviews = reviewService.getByProductId(productId, pageable);
        return ResponseEntity.ok(ApiResponse.success("OK", reviews));
    }

    /**
     * POST /api/reviews — Buyer tạo đánh giá (chỉ khi đơn đã DELIVERED).
     */
    @PostMapping
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<ApiResponse<Review>> createReview(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody ReviewCreateRequest request) {
        Review saved = reviewService.createReview(userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đánh giá thành công", saved));
    }

    /**
     * POST /api/reviews/{id}/reply — Farmer phản hồi đánh giá (1 lần duy nhất).
     */
    @PostMapping("/{id}/reply")
    @PreAuthorize("hasAnyRole('FARMER','HTX_MEMBER','HTX_MANAGER')")
    public ResponseEntity<ApiResponse<Review>> replyReview(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, String> body) {
        Review review = reviewService.addSellerReply(id, userDetails.getId(), body.get("reply"));
        return ResponseEntity.ok(ApiResponse.success("Đã phản hồi đánh giá", review));
    }
}
