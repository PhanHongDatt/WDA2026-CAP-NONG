package com.capnong.service;

import com.capnong.exception.AppException;
import com.capnong.model.Review;
import com.capnong.model.OrderItem;
import com.capnong.model.SubOrder;
import com.capnong.model.enums.OrderStatus;
import com.capnong.repository.OrderItemRepository;
import com.capnong.repository.ReviewRepository;
import com.capnong.repository.SubOrderRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderItemRepository orderItemRepository;
    private final SubOrderRepository subOrderRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         OrderItemRepository orderItemRepository,
                         SubOrderRepository subOrderRepository) {
        this.reviewRepository = reviewRepository;
        this.orderItemRepository = orderItemRepository;
        this.subOrderRepository = subOrderRepository;
    }

    public Page<Review> getByProductId(UUID productId, Pageable pageable) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable);
    }

    @Transactional
    public Review createReview(UUID authorId, Review review) {
        // Verify order item exists and is delivered
        OrderItem orderItem = orderItemRepository.findById(review.getOrderItemId())
                .orElseThrow(() -> new AppException("Mục đơn hàng không tồn tại", HttpStatus.NOT_FOUND));

        SubOrder subOrder = subOrderRepository.findById(orderItem.getSubOrderId())
                .orElseThrow(() -> new AppException("Đơn hàng con không tồn tại", HttpStatus.NOT_FOUND));

        if (subOrder.getStatus() != OrderStatus.DELIVERED) {
            throw new AppException("Chỉ đánh giá được khi đã nhận hàng", HttpStatus.BAD_REQUEST);
        }

        // Check if already reviewed this order item
        if (reviewRepository.existsByOrderItemId(review.getOrderItemId())) {
            throw new AppException("Mục đơn hàng này đã được đánh giá", HttpStatus.CONFLICT);
        }

        review.setAuthorId(authorId);
        return reviewRepository.save(review);
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
}
