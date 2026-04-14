package com.capnong.service;

import com.capnong.dto.request.ReviewCreateRequest;
import com.capnong.exception.AppException;
import com.capnong.model.Review;
import com.capnong.model.OrderItem;
import com.capnong.model.Product;
import com.capnong.model.SubOrder;
import com.capnong.model.enums.OrderStatus;
import com.capnong.repository.OrderItemRepository;
import com.capnong.repository.ProductRepository;
import com.capnong.repository.ReviewRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final OrderEventNotifier orderEventNotifier;

    public ReviewService(ReviewRepository reviewRepository,
                         OrderItemRepository orderItemRepository,
                         ProductRepository productRepository,
                         OrderEventNotifier orderEventNotifier) {
        this.reviewRepository = reviewRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.orderEventNotifier = orderEventNotifier;
    }

    public Page<Review> getByProductId(UUID productId, Pageable pageable) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable);
    }

    @Transactional
    public Review createReview(UUID authorId, ReviewCreateRequest request) {
        // Verify order item exists
        OrderItem orderItem = orderItemRepository.findById(request.getOrderItemId())
                .orElseThrow(() -> new AppException("Mục đơn hàng không tồn tại", HttpStatus.NOT_FOUND));

        // Verify sub-order is DELIVERED (independent lifecycle per shop)
        SubOrder subOrder = orderItem.getSubOrder();
        if (subOrder == null) {
            throw new AppException("Đơn hàng không tồn tại", HttpStatus.NOT_FOUND);
        }
        if (subOrder.getStatus() != OrderStatus.DELIVERED) {
            throw new AppException("Chỉ đánh giá được khi đã nhận hàng", HttpStatus.BAD_REQUEST);
        }

        // Check if already reviewed this order item
        if (reviewRepository.existsByOrderItemId(request.getOrderItemId())) {
            throw new AppException("Mục đơn hàng này đã được đánh giá", HttpStatus.CONFLICT);
        }

        // Create review
        Review review = Review.builder()
                .productId(request.getProductId())
                .orderItemId(request.getOrderItemId())
                .authorId(authorId)
                .rating(request.getRating().shortValue())
                .comment(request.getComment())
                .images(request.getImages() != null ? String.join(",", request.getImages()) : null)
                .build();

        Review saved = reviewRepository.save(review);

        // Update denormalized averageRating and totalReviews on Product
        updateProductRating(request.getProductId());

        // Notify farmer
        Product product = productRepository.findById(request.getProductId()).orElse(null);
        if (product != null) {
            orderEventNotifier.notifyNewReview(saved, product);
        }

        return saved;
    }

    @Transactional
    public Review addSellerReply(UUID reviewId, UUID sellerId, String reply) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException("Đánh giá không tồn tại", HttpStatus.NOT_FOUND));

        if (review.getSellerReply() != null) {
            throw new AppException("Đã trả lời đánh giá này rồi", HttpStatus.CONFLICT);
        }

        review.setSellerReply(reply);
        return reviewRepository.save(review);
    }

    /**
     * Cập nhật averageRating và totalReviews trên Product (denormalized).
     */
    private void updateProductRating(UUID productId) {
        Page<Review> allReviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(
                productId, Pageable.unpaged());

        long count = allReviews.getTotalElements();
        if (count == 0) return;

        double sum = allReviews.getContent().stream()
                .mapToInt(r -> r.getRating().intValue())
                .sum();
        BigDecimal avg = BigDecimal.valueOf(sum / count).setScale(2, RoundingMode.HALF_UP);

        Product product = productRepository.findById(productId).orElse(null);
        if (product != null) {
            product.setAverageRating(avg);
            product.setTotalReviews((int) count);
            productRepository.save(product);
        }
    }
}
