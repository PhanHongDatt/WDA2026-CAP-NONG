package com.capnong.service;

import com.capnong.dto.request.ReviewCreateRequest;
import com.capnong.exception.AppException;
import com.capnong.model.*;
import com.capnong.model.enums.OrderStatus;
import com.capnong.repository.OrderItemRepository;
import com.capnong.repository.ProductRepository;
import com.capnong.repository.ReviewRepository;
import com.capnong.service.impl.ReviewServiceImpl;
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
    @Mock private ProductRepository productRepository;
    @Mock private OrderEventNotifier orderEventNotifier;
    @InjectMocks private ReviewServiceImpl reviewService;

    private UUID authorId;
    private UUID orderItemId;
    private UUID productId;

    @BeforeEach
    void setUp() {
        authorId = UUID.randomUUID();
        orderItemId = UUID.randomUUID();
        productId = UUID.randomUUID();
    }

    /**
     * Helper: builds SubOrder→Order→User(buyerId) chain with the given status.
     */
    private SubOrder buildSubOrderWithBuyer(UUID buyerId, OrderStatus status) {
        User buyer = User.builder().id(buyerId).build();
        Order order = Order.builder().id(UUID.randomUUID()).user(buyer).build();
        return SubOrder.builder()
                .id(UUID.randomUUID()).status(status).order(order).build();
    }

    @Test
    void createReview_shouldSucceed_whenSubOrderDeliveredAndBuyerOwns() {
        SubOrder subOrder = buildSubOrderWithBuyer(authorId, OrderStatus.DELIVERED);
        Product product = Product.builder().id(productId).build();
        OrderItem orderItem = OrderItem.builder()
                .id(orderItemId).subOrder(subOrder).product(product).build();

        ReviewCreateRequest request = ReviewCreateRequest.builder()
                .orderItemId(orderItemId).productId(productId)
                .rating(5).comment("Rất ngon! Sản phẩm tuyệt vời").build();

        when(orderItemRepository.findById(orderItemId)).thenReturn(Optional.of(orderItem));
        when(reviewRepository.existsByOrderItemId(orderItemId)).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenAnswer(i -> i.getArgument(0));
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));

        Review result = reviewService.createReview(authorId, request);

        assertEquals(authorId, result.getAuthorId());
        verify(reviewRepository).save(any(Review.class));
    }

    @Test
    void createReview_shouldThrow_whenSubOrderNotDelivered() {
        SubOrder subOrder = buildSubOrderWithBuyer(authorId, OrderStatus.PREPARING);
        OrderItem orderItem = OrderItem.builder()
                .id(orderItemId).subOrder(subOrder).build();

        ReviewCreateRequest request = ReviewCreateRequest.builder()
                .orderItemId(orderItemId).productId(productId)
                .rating(5).comment("Rất ngon! Sản phẩm tuyệt vời").build();

        when(orderItemRepository.findById(orderItemId)).thenReturn(Optional.of(orderItem));

        assertThrows(AppException.class, () -> reviewService.createReview(authorId, request));
    }

    @Test
    void createReview_shouldThrow_whenBuyerDoesNotOwnOrder() {
        UUID otherUserId = UUID.randomUUID(); // a different user
        SubOrder subOrder = buildSubOrderWithBuyer(otherUserId, OrderStatus.DELIVERED);
        OrderItem orderItem = OrderItem.builder()
                .id(orderItemId).subOrder(subOrder).build();

        ReviewCreateRequest request = ReviewCreateRequest.builder()
                .orderItemId(orderItemId).productId(productId)
                .rating(5).comment("Rất ngon! Sản phẩm tuyệt vời").build();

        when(orderItemRepository.findById(orderItemId)).thenReturn(Optional.of(orderItem));

        AppException ex = assertThrows(AppException.class,
                () -> reviewService.createReview(authorId, request));
        assertTrue(ex.getMessage().contains("không có quyền"));
    }

    @Test
    void createReview_shouldThrow_whenAlreadyReviewed() {
        SubOrder subOrder = buildSubOrderWithBuyer(authorId, OrderStatus.DELIVERED);
        OrderItem orderItem = OrderItem.builder()
                .id(orderItemId).subOrder(subOrder).build();

        ReviewCreateRequest request = ReviewCreateRequest.builder()
                .orderItemId(orderItemId).productId(productId)
                .rating(5).comment("Rất ngon! Sản phẩm tuyệt vời").build();

        when(orderItemRepository.findById(orderItemId)).thenReturn(Optional.of(orderItem));
        when(reviewRepository.existsByOrderItemId(orderItemId)).thenReturn(true);

        assertThrows(AppException.class, () -> reviewService.createReview(authorId, request));
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
