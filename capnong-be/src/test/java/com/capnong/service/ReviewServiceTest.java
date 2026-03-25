package com.capnong.service;

import com.capnong.exception.AppException;
import com.capnong.model.Review;
import com.capnong.model.OrderItem;
import com.capnong.model.SubOrder;
import com.capnong.model.enums.OrderStatus;
import com.capnong.repository.OrderItemRepository;
import com.capnong.repository.ReviewRepository;
import com.capnong.repository.SubOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock private ReviewRepository reviewRepository;
    @Mock private OrderItemRepository orderItemRepository;
    @Mock private SubOrderRepository subOrderRepository;
    @InjectMocks private ReviewService reviewService;

    private UUID authorId;
    private UUID orderItemId;
    private UUID subOrderId;
    private UUID productId;

    @BeforeEach
    void setUp() {
        authorId = UUID.randomUUID();
        orderItemId = UUID.randomUUID();
        subOrderId = UUID.randomUUID();
        productId = UUID.randomUUID();
    }

    @Test
    void createReview_shouldSucceed_whenOrderDelivered() {
        OrderItem orderItem = OrderItem.builder()
                .id(orderItemId).subOrderId(subOrderId).productId(productId).build();
        SubOrder subOrder = SubOrder.builder()
                .id(subOrderId).status(OrderStatus.DELIVERED).build();
        Review review = Review.builder()
                .orderItemId(orderItemId).productId(productId)
                .rating((short) 5).comment("Rất ngon!").build();

        when(orderItemRepository.findById(orderItemId)).thenReturn(Optional.of(orderItem));
        when(subOrderRepository.findById(subOrderId)).thenReturn(Optional.of(subOrder));
        when(reviewRepository.existsByOrderItemId(orderItemId)).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenAnswer(i -> i.getArgument(0));

        Review result = reviewService.createReview(authorId, review);

        assertEquals(authorId, result.getAuthorId());
        verify(reviewRepository).save(any(Review.class));
    }

    @Test
    void createReview_shouldThrow_whenOrderNotDelivered() {
        OrderItem orderItem = OrderItem.builder()
                .id(orderItemId).subOrderId(subOrderId).build();
        SubOrder subOrder = SubOrder.builder()
                .id(subOrderId).status(OrderStatus.PREPARING).build();
        Review review = Review.builder().orderItemId(orderItemId).build();

        when(orderItemRepository.findById(orderItemId)).thenReturn(Optional.of(orderItem));
        when(subOrderRepository.findById(subOrderId)).thenReturn(Optional.of(subOrder));

        assertThrows(AppException.class, () -> reviewService.createReview(authorId, review));
    }

    @Test
    void createReview_shouldThrow_whenAlreadyReviewed() {
        OrderItem orderItem = OrderItem.builder()
                .id(orderItemId).subOrderId(subOrderId).build();
        SubOrder subOrder = SubOrder.builder()
                .id(subOrderId).status(OrderStatus.DELIVERED).build();
        Review review = Review.builder().orderItemId(orderItemId).build();

        when(orderItemRepository.findById(orderItemId)).thenReturn(Optional.of(orderItem));
        when(subOrderRepository.findById(subOrderId)).thenReturn(Optional.of(subOrder));
        when(reviewRepository.existsByOrderItemId(orderItemId)).thenReturn(true);

        assertThrows(AppException.class, () -> reviewService.createReview(authorId, review));
    }

    @Test
    void addSellerReply_shouldSucceed_whenNoExistingReply() {
        UUID reviewId = UUID.randomUUID();
        Review review = Review.builder().id(reviewId).sellerReply(null).build();
        when(reviewRepository.findById(reviewId)).thenReturn(Optional.of(review));
        when(reviewRepository.save(any(Review.class))).thenAnswer(i -> i.getArgument(0));

        Review result = reviewService.addSellerReply(reviewId, UUID.randomUUID(), "Cảm ơn bạn!");

        assertEquals("Cảm ơn bạn!", result.getSellerReply());
    }

    @Test
    void addSellerReply_shouldThrow_whenAlreadyReplied() {
        UUID reviewId = UUID.randomUUID();
        Review review = Review.builder().id(reviewId).sellerReply("Đã reply").build();
        when(reviewRepository.findById(reviewId)).thenReturn(Optional.of(review));

        assertThrows(AppException.class, () ->
                reviewService.addSellerReply(reviewId, UUID.randomUUID(), "Trả lời lần 2"));
    }
}
