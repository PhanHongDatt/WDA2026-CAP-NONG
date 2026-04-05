package com.capnong.service;

import com.capnong.dto.request.AddToCartRequest;
import com.capnong.dto.response.CartItemResponse;
import com.capnong.dto.response.CartResponse;
import com.capnong.exception.ResourceNotFoundException;
import com.capnong.model.Cart;
import com.capnong.model.CartItem;
import com.capnong.model.Product;
import com.capnong.model.User;
import com.capnong.repository.CartRepository;
import com.capnong.repository.ProductRepository;
import com.capnong.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public CartResponse addToCart(String guestSessionId, Long userId, AddToCartRequest request) {
        Cart cart = getOrCreateCart(guestSessionId, userId);

        Product product = productRepository.findById(java.util.Objects.requireNonNull(request.getProductId()))
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

    @Transactional
    public CartResponse getCart(String guestSessionId, Long userId) {
        Cart cart;
        if (userId != null) {
            cart = cartRepository.findByUserId(userId).orElse(null);
        } else {
            cart = cartRepository.findByGuestSessionId(guestSessionId).orElse(null);
        }

        if (cart == null) {
            return CartResponse.builder()
                    .guestSessionId(guestSessionId)
                    .userId(userId)
                    .items(java.util.List.of())
                    .build();
        }

        return mapToCartResponse(cart);
    }

    @Transactional
    public void mergeGuestCartToUser(String guestSessionId, Long userId) {
        if (guestSessionId == null || userId == null) return;

        Optional<Cart> guestCartOpt = cartRepository.findByGuestSessionId(guestSessionId);
        if (guestCartOpt.isEmpty()) return;

        Cart guestCart = guestCartOpt.get();
        Optional<Cart> userCartOpt = cartRepository.findByUserId(userId);

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
            cartRepository.save(java.util.Objects.requireNonNull(userCart));
            // clear guest items to prevent orphan removal cascade from deleting the products? No, orphanRemoval means if we remove from list or delete parent, children are removed.
            // Since we reparented guestItem by setting guestItem.setCart(userCart) and added to userCart, we should clear it from guestCart.
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

    @Transactional
    public void clearCart(String guestSessionId, Long userId) {
        Cart cart;
        if (userId != null) {
            cart = cartRepository.findByUserId(userId).orElse(null);
        } else {
            cart = cartRepository.findByGuestSessionId(guestSessionId).orElse(null);
        }

        if (cart != null) {
            cart.getItems().clear();
            cartRepository.save(cart);
        }
    }

    private Cart getOrCreateCart(String guestSessionId, Long userId) {
        if (userId != null) {
            return cartRepository.findByUserId(userId).orElseGet(() -> {
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                return cartRepository.save(java.util.Objects.requireNonNull(Cart.builder().user(user).build()));
            });
        } else {
            return cartRepository.findByGuestSessionId(guestSessionId).orElseGet(() ->
                    cartRepository.save(java.util.Objects.requireNonNull(Cart.builder().guestSessionId(guestSessionId).build()))
            );
        }
    }

    private CartResponse mapToCartResponse(Cart cart) {
        return CartResponse.builder()
                .id(cart.getId())
                .guestSessionId(cart.getGuestSessionId())
                .userId(cart.getUser() != null ? cart.getUser().getId() : null)
                .items(cart.getItems().stream().map(item -> CartItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .quantity(item.getQuantity())
                        .pricePerUnit(item.getProduct().getPricePerUnit())
                        .build()).collect(Collectors.toList()))
                .build();
    }
}
