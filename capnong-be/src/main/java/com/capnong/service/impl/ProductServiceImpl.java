package com.capnong.service.impl;

import com.capnong.dto.request.ProductCreateRequest;
import com.capnong.dto.response.ProductResponse;
import com.capnong.exception.AppException;
import com.capnong.exception.ResourceNotFoundException;
import com.capnong.mapper.ProductMapper;
import com.capnong.model.Product;
import com.capnong.model.Shop;
import com.capnong.repository.ProductRepository;
import com.capnong.repository.ShopRepository;
import com.capnong.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ShopRepository shopRepository;
    private final ProductMapper productMapper;

    @Override
    @Transactional
    public ProductResponse createProduct(ProductCreateRequest request, String username) {
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
                .status("UPCOMING")
                .build();

        return productMapper.toProductResponse(productRepository.save(product));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByShopSlug(String slug) {
        return productRepository.findByShopSlugAndStatusNot(slug, "HIDDEN").stream()
                .map(productMapper::toProductResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        return productMapper.toProductResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllPublicProducts() {
        return productRepository.findByStatusNot("HIDDEN").stream()
                .map(productMapper::toProductResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(UUID productId, ProductCreateRequest request, String username) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (!product.getShop().getOwner().getUsername().equals(username)) {
            throw new AppException("Bạn không có quyền chỉnh sửa sản phẩm này", HttpStatus.FORBIDDEN);
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategory(request.getCategory());
        product.setUnitCode(request.getUnitCode());
        product.setPricePerUnit(request.getPricePerUnit());
        product.setAvailableQuantity(request.getAvailableQuantity());
        product.setLocationDetail(request.getLocationDetail());

        return productMapper.toProductResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public void softDeleteProduct(UUID productId, String username) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (!product.getShop().getOwner().getUsername().equals(username)) {
            throw new AppException("Bạn không có quyền xóa sản phẩm này", HttpStatus.FORBIDDEN);
        }

        product.softDelete(username);
        productRepository.save(product);
    }
}
