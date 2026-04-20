package com.capnong.service;

import com.capnong.dto.request.ReviewCreateRequest;
import com.capnong.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ReviewService {
    Page<Review> getByProductId(UUID productId, Pageable pageable);
    Review createReview(UUID authorId, ReviewCreateRequest request);
    Review addSellerReply(UUID reviewId, UUID sellerId, String reply);

    // /me routes
    Page<Review> getMyReviews(UUID authorId, Pageable pageable);
    Page<Review> getShopReviews(String sellerUsername, Pageable pageable);
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

    @Override
    public Page<Review> getByProductId(UUID productId, Pageable pageable) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable);
    }

    @Override
    public Page<Review> getMyReviews(UUID authorId, Pageable pageable) {
        return reviewRepository.findByAuthorIdOrderByCreatedAtDesc(authorId, pageable);
    }

    @Override
    public Page<Review> getShopReviews(String sellerUsername, Pageable pageable) {
        return reviewRepository.findByShopOwnerUsernameOrderByCreatedAtDesc(sellerUsername, pageable);
    }

    @Override
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

        // Verify the authenticated user is the buyer who owns this order
        Order parentOrder = subOrder.getOrder();
        if (parentOrder == null || parentOrder.getUser() == null
                || !parentOrder.getUser().getId().equals(authorId)) {
            throw new AppException("Bạn không có quyền đánh giá mục đơn hàng này", HttpStatus.FORBIDDEN);
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

    @Override
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
     * Sử dụng aggregate query thay vì load toàn bộ review vào memory.
     */
    private void updateProductRating(UUID productId) {
        Object[] stats = reviewRepository.getProductRatingStats(productId);
        if (stats == null || stats.length == 0) return;

        // JPA may return Object[] directly [avg, count] or nested [[avg, count]]
        Object avgObj;
        Object countObj;
        if (stats[0] instanceof Object[]) {
            Object[] row = (Object[]) stats[0];
            if (row[0] == null) return;
            avgObj = row[0];
            countObj = row[1];
        } else {
            if (stats[0] == null) return;
            avgObj = stats[0];
            countObj = stats[1];
        }

        Double avg = ((Number) avgObj).doubleValue();
        Long count = ((Number) countObj).longValue();

        BigDecimal averageRating = BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP);

        Product product = productRepository.findById(productId).orElse(null);
        if (product != null) {
            product.setAverageRating(averageRating);
            product.setTotalReviews(count.intValue());
            productRepository.save(product);
        }
    }
}
