package com.capnong.service.impl;

import com.capnong.dto.request.AddToCartRequest;
import com.capnong.dto.response.CartResponse;
import com.capnong.exception.ResourceNotFoundException;
import com.capnong.mapper.CartMapper;
import com.capnong.model.Cart;
import com.capnong.model.CartItem;
import com.capnong.model.Product;
import com.capnong.model.User;
import com.capnong.repository.CartRepository;
import com.capnong.repository.ProductRepository;
import com.capnong.repository.UserRepository;
import com.capnong.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartMapper cartMapper;

    @Override
    @Transactional
    public CartResponse addToCart(String guestSessionId, UUID userId, AddToCartRequest request) {
        Cart cart = getOrCreateCart(guestSessionId, userId);

        Product product = productRepository.findById(Objects.requireNonNull(request.getProductId()))
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(request.getProductId()))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity().add(request.getQuantity()));
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
            cart.getItems().add(newItem);
        }

        cartRepository.save(cart);
        return mapToCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse getCart(String guestSessionId, UUID userId) {
        Cart cart;
        if (userId != null) {
            cart = cartRepository.findByUser_Id(userId).orElse(null);
        } else {
            cart = cartRepository.findByGuestSessionId(guestSessionId).orElse(null);
        }

        if (cart == null) {
            return CartResponse.builder()
                    .guestSessionId(guestSessionId)
                    .userId(userId)
                    .items(List.of())
                    .build();
        }

        return mapToCartResponse(cart);
    }

    @Override
    @Transactional
    public void mergeGuestCartToUser(String guestSessionId, UUID userId) {
        if (guestSessionId == null || userId == null) return;

        Optional<Cart> guestCartOpt = cartRepository.findByGuestSessionId(guestSessionId);
        if (guestCartOpt.isEmpty()) return;

        Cart guestCart = guestCartOpt.get();
        Optional<Cart> userCartOpt = cartRepository.findByUser_Id(userId);

        if (userCartOpt.isPresent()) {
            Cart userCart = userCartOpt.get();
            for (CartItem guestItem : guestCart.getItems()) {
                Optional<CartItem> existingUserItem = userCart.getItems().stream()
                        .filter(item -> item.getProduct().getId().equals(guestItem.getProduct().getId()))
                        .findFirst();

                if (existingUserItem.isPresent()) {
                    CartItem userItem = existingUserItem.get();
                    userItem.setQuantity(userItem.getQuantity().add(guestItem.getQuantity()));
                } else {
                    guestItem.setCart(userCart);
                    userCart.getItems().add(guestItem);
                }
            }
            cartRepository.save(Objects.requireNonNull(userCart));
            guestCart.getItems().clear();
            cartRepository.delete(guestCart);
        } else {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            guestCart.setUser(user);
            guestCart.setGuestSessionId(null);
            cartRepository.save(guestCart);
        }
    }

    @Override
    @Transactional
    public void clearCart(String guestSessionId, UUID userId) {
        Cart cart;
        if (userId != null) {
            cart = cartRepository.findByUser_Id(userId).orElse(null);
        } else {
            cart = cartRepository.findByGuestSessionId(guestSessionId).orElse(null);
        }

        if (cart != null) {
            cart.getItems().clear();
            cartRepository.save(cart);
        }
    }

    private Cart getOrCreateCart(String guestSessionId, UUID userId) {
        if (userId != null) {
            return cartRepository.findByUser_Id(userId).orElseGet(() -> {
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                return cartRepository.save(Objects.requireNonNull(Cart.builder().user(user).build()));
            });
        } else {
            return cartRepository.findByGuestSessionId(guestSessionId).orElseGet(() ->
                    cartRepository.save(Objects.requireNonNull(Cart.builder().guestSessionId(guestSessionId).build()))
            );
        }
    }

    /**
     * Cart response mapping uses CartMapper for items.
     * Top-level mapping stays manual due to conditional userId/guestSessionId.
     */
    private CartResponse mapToCartResponse(Cart cart) {
        return CartResponse.builder()
                .id(cart.getId())
                .guestSessionId(cart.getGuestSessionId())
                .userId(cart.getUser() != null ? cart.getUser().getId() : null)
                .items(cart.getItems().stream()
                        .map(cartMapper::toCartItemResponse)
                        .collect(Collectors.toList()))
                .build();
    }
}
