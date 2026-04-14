package com.capnong.service.impl;

import com.capnong.dto.request.ProductCreateRequest;
import com.capnong.dto.request.ProductFilterParams;
import com.capnong.dto.response.ProductResponse;
import com.capnong.exception.AppException;
import com.capnong.exception.ResourceNotFoundException;
import com.capnong.mapper.ProductMapper;
import com.capnong.model.Product;
import com.capnong.model.ProductImage;
import com.capnong.model.Shop;
import com.capnong.model.Unit;
import com.capnong.model.enums.FarmingMethod;
import com.capnong.model.enums.ProductCategory;
import com.capnong.model.enums.ProductStatus;
import com.capnong.repository.ProductImageRepository;
import com.capnong.repository.ProductRepository;
import com.capnong.repository.ShopRepository;
import com.capnong.repository.UnitRepository;
import com.capnong.service.CloudinaryService;
import com.capnong.service.ProductService;
import com.capnong.specification.ProductSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private static final int MAX_IMAGES = 10;

    private final ProductRepository productRepository;
    private final ShopRepository shopRepository;
    private final ProductImageRepository productImageRepository;
    private final UnitRepository unitRepository;
    private final CloudinaryService cloudinaryService;
    private final ProductMapper productMapper;

    // ═══════════════════════════════════════════════════════════════
    //  CREATE
    // ═══════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public ProductResponse createProduct(ProductCreateRequest request, String username) {
        Shop shop = findShopByUsername(username);
        ProductCategory category = parseCategory(request.getCategory());
        FarmingMethod farmingMethod = parseFarmingMethod(request.getFarmingMethod());
        Unit unit = findUnit(request.getUnitCode());

        Product product = Product.builder()
                .shop(shop)
                .name(request.getName())
                .description(request.getDescription())
                .category(category)
                .unit(unit)
                .pricePerUnit(request.getPricePerUnit())
                .availableQuantity(request.getAvailableQuantity())
                .locationDetail(request.getLocationDetail())
                .harvestDate(request.getHarvestDate())
                .availableFrom(request.getAvailableFrom())
                .farmingMethod(farmingMethod)
                .pesticideFree(request.getPesticideFree() != null ? request.getPesticideFree() : false)
                .minOrderQuantity(request.getMinOrderQuantity() != null ? request.getMinOrderQuantity() : BigDecimal.ONE)
                .weight(request.getWeight())
                .origin(request.getOrigin())
                .shelfLife(request.getShelfLife())
                .status(ProductStatus.UPCOMING)
                .build();

        return productMapper.toProductResponse(productRepository.save(product));
    }

    // ═══════════════════════════════════════════════════════════════
    //  SEARCH / LIST (Paginated + Filtered)
    // ═══════════════════════════════════════════════════════════════

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProducts(ProductFilterParams filter, Pageable pageable) {
        return productRepository
                .findAll(ProductSpecification.fromFilter(filter), pageable)
                .map(productMapper::toProductResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        return productMapper.toProductResponse(product);
    }

    // ═══════════════════════════════════════════════════════════════
    //  UPDATE (full)
    // ═══════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public ProductResponse updateProduct(UUID productId, ProductCreateRequest request, String username) {
        Product product = findProductOwnedBy(productId, username);
        Unit unit = findUnit(request.getUnitCode());

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategory(parseCategory(request.getCategory()));
        product.setUnit(unit);
        product.setPricePerUnit(request.getPricePerUnit());
        product.setAvailableQuantity(request.getAvailableQuantity());
        product.setLocationDetail(request.getLocationDetail());
        product.setHarvestDate(request.getHarvestDate());
        product.setAvailableFrom(request.getAvailableFrom());
        product.setFarmingMethod(parseFarmingMethod(request.getFarmingMethod()));
        if (request.getPesticideFree() != null) {
            product.setPesticideFree(request.getPesticideFree());
        }
        if (request.getMinOrderQuantity() != null) {
            product.setMinOrderQuantity(request.getMinOrderQuantity());
        }
        product.setWeight(request.getWeight());
        product.setOrigin(request.getOrigin());
        product.setShelfLife(request.getShelfLife());

        return productMapper.toProductResponse(productRepository.save(product));
    }

    // ═══════════════════════════════════════════════════════════════
    //  PATCH — Quick updates
    // ═══════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public ProductResponse updateStatus(UUID productId, String status, String username) {
        Product product = findProductOwnedBy(productId, username);
        try {
            product.setStatus(ProductStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new AppException("Trạng thái không hợp lệ: " + status +
                    ". Các giá trị hợp lệ: IN_SEASON, UPCOMING, OFF_SEASON, OUT_OF_STOCK, HIDDEN",
                    HttpStatus.BAD_REQUEST);
        }
        return productMapper.toProductResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse updatePrice(UUID productId, BigDecimal newPrice, String username) {
        Product product = findProductOwnedBy(productId, username);
        if (newPrice == null || newPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException("Giá phải lớn hơn 0", HttpStatus.BAD_REQUEST);
        }
        product.setPricePerUnit(newPrice);
        return productMapper.toProductResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse updateQuantity(UUID productId, BigDecimal newQuantity, String username) {
        Product product = findProductOwnedBy(productId, username);
        if (newQuantity == null || newQuantity.compareTo(BigDecimal.ZERO) < 0) {
            throw new AppException("Sản lượng không hợp lệ", HttpStatus.BAD_REQUEST);
        }
        product.setAvailableQuantity(newQuantity);
        // Tự động chuyển trạng thái nếu hết hàng
        if (newQuantity.compareTo(BigDecimal.ZERO) == 0) {
            product.setStatus(ProductStatus.OUT_OF_STOCK);
        }
        return productMapper.toProductResponse(productRepository.save(product));
    }

    // ═══════════════════════════════════════════════════════════════
    //  DELETE
    // ═══════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public void softDeleteProduct(UUID productId, String username) {
        Product product = findProductOwnedBy(productId, username);
        product.softDelete(username);
        productRepository.save(product);
    }

    // ═══════════════════════════════════════════════════════════════
    //  IMAGES
    // ═══════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public ProductResponse uploadProductImages(UUID productId, List<MultipartFile> files, String username) {
        Product product = findProductOwnedBy(productId, username);

        int currentCount = productImageRepository.countByProductId(productId);
        if (currentCount + files.size() > MAX_IMAGES) {
            throw new AppException(
                    "Tối đa " + MAX_IMAGES + " ảnh. Hiện có " + currentCount + ", thêm " + files.size() + " sẽ vượt quá.",
                    HttpStatus.BAD_REQUEST);
        }

        short sortOrder = (short) currentCount;
        for (MultipartFile file : files) {
            String url = cloudinaryService.uploadImage(file, "capnong/products/" + productId);
            ProductImage image = ProductImage.builder()
                    .product(product)
                    .url(url)
                    .sortOrder(sortOrder++)
                    .build();
            productImageRepository.save(image);
        }

        Product refreshed = productRepository.findById(productId).orElseThrow();
        return productMapper.toProductResponse(refreshed);
    }

    @Override
    @Transactional
    public void deleteProductImage(UUID productId, UUID imageId, String username) {
        findProductOwnedBy(productId, username);
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductImage", "id", imageId));

        if (!image.getProduct().getId().equals(productId)) {
            throw new AppException("Ảnh không thuộc sản phẩm này", HttpStatus.BAD_REQUEST);
        }

        productImageRepository.delete(image);
    }

    @Override
    @Transactional
    public void deleteProductImages(UUID productId, List<UUID> imageIds, String username) {
        findProductOwnedBy(productId, username);
        for (UUID imageId : imageIds) {
            deleteProductImage(productId, imageId, username);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  HELPERS
    // ═══════════════════════════════════════════════════════════════

    private Product findProductOwnedBy(UUID productId, String username) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        if (!product.getShop().getOwner().getUsername().equals(username)) {
            throw new AppException("Bạn không có quyền thao tác sản phẩm này", HttpStatus.FORBIDDEN);
        }
        return product;
    }

    private Shop findShopByUsername(String username) {
        return shopRepository.findByOwnerUsername(username)
                .orElseThrow(() -> new AppException("Bạn chưa có gian hàng. Vui lòng tạo gian hàng trước.",
                        HttpStatus.BAD_REQUEST));
    }

    private Unit findUnit(String unitCode) {
        if (unitCode == null || unitCode.isBlank()) {
            throw new AppException("Đơn vị tính không được để trống", HttpStatus.BAD_REQUEST);
        }
        return unitRepository.findByCode(unitCode.toUpperCase())
                .orElseThrow(() -> new AppException(
                        "Đơn vị tính không hợp lệ: " + unitCode + ". Vui lòng kiểm tra GET /api/units.",
                        HttpStatus.BAD_REQUEST));
    }

    private ProductCategory parseCategory(String category) {
        try {
            return ProductCategory.valueOf(category.toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new AppException("Danh mục không hợp lệ: " + category +
                    ". Các giá trị hợp lệ: FRUIT, VEGETABLE, GRAIN, TUBER, HERB, OTHER",
                    HttpStatus.BAD_REQUEST);
        }
    }

    private FarmingMethod parseFarmingMethod(String method) {
        if (method == null || method.isBlank()) return FarmingMethod.TRADITIONAL;
        try {
            return FarmingMethod.valueOf(method.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AppException("Phương thức canh tác không hợp lệ: " + method +
                    ". Các giá trị hợp lệ: TRADITIONAL, ORGANIC, VIETGAP, GLOBALGAP",
                    HttpStatus.BAD_REQUEST);
        }
    }
}
