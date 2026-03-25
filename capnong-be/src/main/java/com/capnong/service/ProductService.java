package com.capnong.service;

import com.capnong.exception.AppException;
import com.capnong.model.Product;
import com.capnong.model.ProductImage;
import com.capnong.model.enums.ProductCategory;
import com.capnong.model.enums.ProductStatus;
import com.capnong.repository.ProductImageRepository;
import com.capnong.repository.ProductRepository;
import com.capnong.repository.ShopRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ShopRepository shopRepository;

    public ProductService(ProductRepository productRepository,
                          ProductImageRepository productImageRepository,
                          ShopRepository shopRepository) {
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.shopRepository = shopRepository;
    }

    public Product getById(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy sản phẩm", HttpStatus.NOT_FOUND));
    }

    public List<ProductImage> getImages(UUID productId) {
        return productImageRepository.findByProductIdOrderBySortOrder(productId);
    }

    public Page<Product> search(ProductCategory category, ProductStatus status,
                                BigDecimal minPrice, BigDecimal maxPrice,
                                String keyword, Pageable pageable) {
        return productRepository.searchProducts(
                category != null ? category.name() : null,
                status != null ? status.name() : null,
                minPrice, maxPrice, keyword, pageable);
    }

    @Transactional
    public Product create(UUID ownerId, Product product, List<String> imageUrls) {
        var shop = shopRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new AppException("Bạn chưa có gian hàng", HttpStatus.BAD_REQUEST));

        product.setShopId(shop.getId());
        Product saved = productRepository.save(product);

        if (imageUrls != null) {
            for (int i = 0; i < imageUrls.size(); i++) {
                ProductImage img = ProductImage.builder()
                        .productId(saved.getId())
                        .url(imageUrls.get(i))
                        .sortOrder((short) i)
                        .build();
                productImageRepository.save(img);
            }
        }
        return saved;
    }

    @Transactional
    public Product update(UUID productId, UUID ownerId, Product updates) {
        Product product = getById(productId);
        var shop = shopRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new AppException("Bạn chưa có gian hàng", HttpStatus.BAD_REQUEST));
        if (!product.getShopId().equals(shop.getId())) {
            throw new AppException("Bạn không có quyền sửa sản phẩm này", HttpStatus.FORBIDDEN);
        }

        if (updates.getName() != null) product.setName(updates.getName());
        if (updates.getDescription() != null) product.setDescription(updates.getDescription());
        if (updates.getCategory() != null) product.setCategory(updates.getCategory());
        if (updates.getUnitCode() != null) product.setUnitCode(updates.getUnitCode());
        if (updates.getPricePerUnit() != null) product.setPricePerUnit(updates.getPricePerUnit());
        if (updates.getAvailableQuantity() != null) product.setAvailableQuantity(updates.getAvailableQuantity());
        if (updates.getHarvestDate() != null) product.setHarvestDate(updates.getHarvestDate());
        if (updates.getAvailableFrom() != null) product.setAvailableFrom(updates.getAvailableFrom());
        if (updates.getFarmingMethod() != null) product.setFarmingMethod(updates.getFarmingMethod());
        if (updates.getPesticideFree() != null) product.setPesticideFree(updates.getPesticideFree());
        if (updates.getLocationDetail() != null) product.setLocationDetail(updates.getLocationDetail());

        return productRepository.save(product);
    }

    @Transactional
    public void updateStatus(UUID productId, UUID ownerId, ProductStatus status) {
        Product product = getById(productId);
        var shop = shopRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new AppException("Bạn chưa có gian hàng", HttpStatus.BAD_REQUEST));
        if (!product.getShopId().equals(shop.getId())) {
            throw new AppException("Bạn không có quyền sửa sản phẩm này", HttpStatus.FORBIDDEN);
        }
        product.setStatus(status);
        productRepository.save(product);
    }
}
