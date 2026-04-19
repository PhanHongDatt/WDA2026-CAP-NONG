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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Review", description = "Hệ thống Feedback, Đánh giá và Phản hồi theo sản phẩm")
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
    @Operation(summary = "Lấy đánh giá sản phẩm", description = "Liệt kê và phân trang các bài đánh giá, bình luận của khách hàng về một mặt hàng chuyên biệt.")
    public ResponseEntity<ApiResponse<Page<Review>>> getProductReviews(
            @PathVariable UUID productId,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<Review> reviews = reviewService.getByProductId(productId, pageable);
        return ResponseEntity.ok(ApiResponse.success("OK", reviews));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Lấy đánh giá của tôi", description = "Buyer xem lại danh sách các bài đánh giá mình đã viết.")
    public ResponseEntity<ApiResponse<Page<Review>>> getMyReviews(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("OK",
                reviewService.getMyReviews(userDetails.getId(), pageable)));
    }

    @GetMapping("/seller")
    @PreAuthorize("hasAnyRole('FARMER','HTX_MEMBER','HTX_MANAGER')")
    @Operation(summary = "Xem đánh giá về shop của tôi", description = "Seller xem tất cả đánh giá của khách hàng về các sản phẩm thuộc shop mình.")
    public ResponseEntity<ApiResponse<Page<Review>>> getShopReviews(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("OK",
                reviewService.getShopReviews(userDetails.getUsername(), pageable)));
    }

    /**
     * POST /api/reviews — Buyer tạo đánh giá (chỉ khi đơn đã DELIVERED).
     */
    @PostMapping
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Người mua viết đánh giá", description = "Khách hàng tạo phản hồi gồm số điểm và nội dung bình luận sau khi sản phẩm đã được giao.")
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
    @Operation(summary = "Chủ shop trả lời đánh giá", description = "Nhà cung cấp trả lời lại bình luận của người mua với tư cách shop.")
    public ResponseEntity<ApiResponse<Review>> replyReview(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, String> body) {
        Review review = reviewService.addSellerReply(id, userDetails.getId(), body.get("reply"));
        return ResponseEntity.ok(ApiResponse.success("Đã phản hồi đánh giá", review));
    }
}
