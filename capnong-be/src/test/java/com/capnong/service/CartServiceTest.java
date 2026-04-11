package com.capnong.service;

import com.capnong.exception.AppException;
import com.capnong.model.Cart;
import com.capnong.model.CartItem;
import com.capnong.model.Product;
import com.capnong.repository.CartItemRepository;
import com.capnong.repository.CartRepository;
import com.capnong.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock private CartRepository cartRepository;
    @Mock private CartItemRepository cartItemRepository;
    @Mock private ProductRepository productRepository;
    @InjectMocks private CartService cartService;

    private UUID userId;
    private UUID productId;
    private Cart cart;
    private Product product;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        productId = UUID.randomUUID();
        cart = Cart.builder().id(UUID.randomUUID()).userId(userId).build();
        product = Product.builder()
                .id(productId)
                .name("Xoài cát")
                .availableQuantity(BigDecimal.valueOf(100))
                .build();
    }

    @Test
    void addItem_shouldCreateNewItem_whenProductNotInCart() {
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findByCartIdAndProductId(cart.getId(), productId))
                .thenReturn(Optional.empty());
        when(cartItemRepository.save(any(CartItem.class))).thenAnswer(i -> i.getArgument(0));

        CartItem result = cartService.addItem(userId, productId, BigDecimal.valueOf(5));

        assertEquals(BigDecimal.valueOf(5), result.getQuantity());
        verify(cartItemRepository).save(any(CartItem.class));
    }

    @Test
    void addItem_shouldAccumulateQuantity_whenProductAlreadyInCart() {
        CartItem existing = CartItem.builder()
                .id(UUID.randomUUID())
                .cartId(cart.getId())
                .productId(productId)
                .quantity(BigDecimal.valueOf(3))
                .build();

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findByCartIdAndProductId(cart.getId(), productId))
                .thenReturn(Optional.of(existing));
        when(cartItemRepository.save(any(CartItem.class))).thenAnswer(i -> i.getArgument(0));

        CartItem result = cartService.addItem(userId, productId, BigDecimal.valueOf(2));

        assertEquals(0, BigDecimal.valueOf(5).compareTo(result.getQuantity()));
    }

    @Test
    void addItem_shouldThrow_whenProductNotFound() {
        when(productRepository.findById(productId)).thenReturn(Optional.empty());

        assertThrows(AppException.class, () ->
                cartService.addItem(userId, productId, BigDecimal.valueOf(1)));
    }

    @Test
    void addItem_shouldThrow_whenInsufficientStock() {
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));

        assertThrows(AppException.class, () ->
                cartService.addItem(userId, productId, BigDecimal.valueOf(999)));
    }
}
