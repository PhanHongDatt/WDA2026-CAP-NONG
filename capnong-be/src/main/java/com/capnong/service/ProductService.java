package com.capnong.service;

import com.capnong.dto.request.ProductCreateRequest;
import com.capnong.dto.request.ProductFilterParams;
import com.capnong.dto.response.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface ProductService {
    ProductResponse createProduct(ProductCreateRequest request, String username);

    /** Search/filter with pagination — replaces old getAllPublicProducts() and getProductsByShopSlug() */
    Page<ProductResponse> searchProducts(ProductFilterParams filter, Pageable pageable);

    /** Get all products of a specific seller (including hidden/out of stock) */
    Page<ProductResponse> getSellerProducts(String username, Pageable pageable);

    ProductResponse getProductById(UUID productId);

    /** Get N random active products */
    List<ProductResponse> getRandomProducts(int limit);

    ProductResponse updateProduct(UUID productId, ProductCreateRequest request, String username);
    void softDeleteProduct(UUID productId, String username);

    // Images
    ProductResponse uploadProductImages(UUID productId, List<MultipartFile> files, String username);
    void deleteProductImage(UUID productId, UUID imageId, String username);
    void deleteProductImages(UUID productId, List<UUID> imageIds, String username);
    void updateImageSortOrder(UUID productId, List<UUID> imageIds, String username);

    // Quick PATCH operations
    ProductResponse updateStatus(UUID productId, String status, String username);
    ProductResponse updatePrice(UUID productId, BigDecimal newPrice, String username);
    ProductResponse updateQuantity(UUID productId, BigDecimal newQuantity, String username);
}