package com.capnong.service;

import com.capnong.exception.AppException;
import com.capnong.model.Cart;
import com.capnong.model.CartItem;
import com.capnong.model.Product;
import com.capnong.repository.CartItemRepository;
import com.capnong.repository.CartRepository;
import com.capnong.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public CartService(CartRepository cartRepository,
                       CartItemRepository cartItemRepository,
                       ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    public Cart getOrCreateCart(UUID userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> cartRepository.save(Cart.builder().userId(userId).build()));
    }

    public List<CartItem> getCartItems(UUID cartId) {
        return cartItemRepository.findByCartId(cartId);
    }

    @Transactional
    public CartItem addItem(UUID userId, UUID productId, BigDecimal quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException("Sản phẩm không tồn tại", HttpStatus.NOT_FOUND));

        if (product.getAvailableQuantity().compareTo(quantity) < 0) {
            throw new AppException("Sản phẩm không đủ số lượng (còn " + product.getAvailableQuantity() + ")", HttpStatus.CONFLICT);
        }

        Cart cart = getOrCreateCart(userId);
        var existing = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId);
        if (existing.isPresent()) {
            CartItem item = existing.get();
            BigDecimal newQty = item.getQuantity().add(quantity);
            if (product.getAvailableQuantity().compareTo(newQty) < 0) {
                throw new AppException("Tổng số lượng vượt quá tồn kho", HttpStatus.CONFLICT);
            }
            item.setQuantity(newQty);
            return cartItemRepository.save(item);
        }

        return cartItemRepository.save(CartItem.builder()
                .cartId(cart.getId())
                .productId(productId)
                .quantity(quantity)
                .build());
    }

    @Transactional
    public CartItem updateItemQuantity(UUID itemId, UUID userId, BigDecimal quantity) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new AppException("Item không tồn tại", HttpStatus.NOT_FOUND));

        Product product = productRepository.findById(item.getProductId())
                .orElseThrow(() -> new AppException("Sản phẩm không tồn tại", HttpStatus.NOT_FOUND));

        if (product.getAvailableQuantity().compareTo(quantity) < 0) {
            throw new AppException("Số lượng vượt quá tồn kho", HttpStatus.CONFLICT);
        }

        item.setQuantity(quantity);
        return cartItemRepository.save(item);
    }

    @Transactional
    public void removeItem(UUID itemId) {
        cartItemRepository.deleteById(itemId);
    }

    @Transactional
    public void clearCart(UUID cartId) {
        cartItemRepository.deleteByCartId(cartId);
    }
}
