// src/main/java/com/capnong/service/ProductService.java
package com.capnong.service;

import com.capnong.dto.request.ProductCreateRequest;
import com.capnong.exception.AppException;
import com.capnong.exception.ResourceNotFoundException;
import com.capnong.model.Product;
import com.capnong.model.Shop;
import com.capnong.repository.ProductRepository;
import com.capnong.repository.ShopRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final ShopRepository shopRepository;

    public ProductService(ProductRepository productRepository, ShopRepository shopRepository) {
        this.productRepository = productRepository;
        this.shopRepository = shopRepository;
    }

    @SuppressWarnings("null")
    @Transactional
    public Product createProduct(ProductCreateRequest request, String username) {
        Shop shop = shopRepository.findByOwnerUsername(username)
                .orElseThrow(() -> new AppException("Bạn chưa có gian hàng. Vui lòng tạo gian hàng trước.",
                        HttpStatus.BAD_REQUEST));

        Product product = Product.builder()
                .shop(shop)
                .name(request.getName())
                .description(request.getDescription())
                .category(request.getCategory())
                .unitCode(request.getUnitCode())
                .pricePerUnit(request.getPricePerUnit())
                .availableQuantity(request.getAvailableQuantity())
                .locationDetail(request.getLocationDetail())
                .status("UPCOMING") // Default status theo doc
                .build();

        return Objects.requireNonNull(productRepository.save(product));
    }

    @Transactional(readOnly = true)
    public List<Product> getProductsByShopSlug(String slug) {
        // Không trả về các sản phẩm đã bị ẩn (HIDDEN)
        return productRepository.findByShopSlugAndStatusNot(slug, "HIDDEN");
    }

    @SuppressWarnings("null")
    @Transactional
    public void softDeleteProduct(UUID productId, String username) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        // RBAC: Verify ownership
        if (!product.getShop().getOwner().getUsername().equals(username)) {
            throw new AppException("Bạn không có quyền xóa sản phẩm này", HttpStatus.FORBIDDEN);
        }

        // Soft delete bằng cách chuyển trạng thái
        product.setStatus("HIDDEN");
        productRepository.save(product);
    }
}