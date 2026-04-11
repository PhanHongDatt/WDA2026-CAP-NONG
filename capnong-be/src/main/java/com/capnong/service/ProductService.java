package com.capnong.service;

import com.capnong.dto.request.ProductCreateRequest;
import com.capnong.dto.response.ProductResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface ProductService {
    ProductResponse createProduct(ProductCreateRequest request, String username);
    List<ProductResponse> getProductsByShopSlug(String slug);
    ProductResponse getProductById(UUID productId);
    List<ProductResponse> getAllPublicProducts();
    ProductResponse updateProduct(UUID productId, ProductCreateRequest request, String username);
    void softDeleteProduct(UUID productId, String username);
    ProductResponse uploadProductImages(UUID productId, List<MultipartFile> files, String username);
}