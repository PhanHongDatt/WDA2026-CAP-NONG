package com.capnong.service;

import com.capnong.dto.request.AddToCartRequest;
import com.capnong.dto.response.CartResponse;
import com.capnong.mapper.CartMapper;
import com.capnong.model.Cart;
import com.capnong.model.CartItem;
import com.capnong.model.Product;
import com.capnong.model.User;
import com.capnong.repository.CartRepository;
import com.capnong.repository.ProductRepository;
import com.capnong.repository.UserRepository;
import com.capnong.service.impl.CartServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock private CartRepository cartRepository;
    @Mock private ProductRepository productRepository;
    @Mock private UserRepository userRepository;
    @Mock private CartMapper cartMapper;
    @InjectMocks private CartServiceImpl cartService;

    private UUID userId;
    private UUID productId;
    private User user;
    private Cart cart;
    private Product product;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        productId = UUID.randomUUID();
        user = User.builder().id(userId).build();
        cart = Cart.builder().id(UUID.randomUUID()).user(user).items(new ArrayList<>()).build();
        product = Product.builder()
                .id(productId)
                .name("Xoài cát")
                .availableQuantity(BigDecimal.valueOf(100))
                .build();
    }

    @Test
    void addToCart_shouldCreateNewItem_whenProductNotInCart() {
        AddToCartRequest request = new AddToCartRequest();
        request.setProductId(productId);
        request.setQuantity(BigDecimal.valueOf(5));

        when(cartRepository.findByUser_Id(userId)).thenReturn(Optional.of(cart));
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(cartRepository.save(any(Cart.class))).thenReturn(cart);

        CartResponse response = cartService.addToCart(null, userId, request);

        assertNotNull(response);
        verify(cartRepository).save(cart);
        assertEquals(1, cart.getItems().size());
        assertEquals(BigDecimal.valueOf(5), cart.getItems().get(0).getQuantity());
    }

    @Test
    void addToCart_shouldAccumulateQuantity_whenProductAlreadyInCart() {
        AddToCartRequest request = new AddToCartRequest();
        request.setProductId(productId);
        request.setQuantity(BigDecimal.valueOf(2));

        CartItem existing = CartItem.builder()
                .id(UUID.randomUUID())
                .cart(cart)
                .product(product)
                .quantity(BigDecimal.valueOf(3))
                .build();
        cart.getItems().add(existing);

        when(cartRepository.findByUser_Id(userId)).thenReturn(Optional.of(cart));
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(cartRepository.save(any(Cart.class))).thenReturn(cart);

        CartResponse response = cartService.addToCart(null, userId, request);

        assertNotNull(response);
        assertEquals(1, cart.getItems().size());
        assertEquals(0, BigDecimal.valueOf(5).compareTo(cart.getItems().get(0).getQuantity()));
    }
}
