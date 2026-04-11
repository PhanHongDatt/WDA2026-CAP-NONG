package com.capnong.service.impl;

import com.capnong.dto.request.ProductCreateRequest;
import com.capnong.dto.response.ProductResponse;
import com.capnong.exception.AppException;
import com.capnong.exception.ResourceNotFoundException;
import com.capnong.mapper.ProductMapper;
import com.capnong.model.Product;
import com.capnong.model.ProductImage;
import com.capnong.model.Shop;
import com.capnong.model.enums.FarmingMethod;
import com.capnong.model.enums.ProductCategory;
import com.capnong.model.enums.ProductStatus;
import com.capnong.repository.ProductImageRepository;
import com.capnong.repository.ProductRepository;
import com.capnong.repository.ShopRepository;
import com.capnong.service.CloudinaryService;
import com.capnong.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private static final int MAX_IMAGES = 10;

    private final ProductRepository productRepository;
    private final ShopRepository shopRepository;
    private final ProductImageRepository productImageRepository;
    private final CloudinaryService cloudinaryService;
    private final ProductMapper productMapper;

    @Override
    @Transactional
    public ProductResponse createProduct(ProductCreateRequest request, String username) {
        Shop shop = shopRepository.findByOwnerUsername(username)
                .orElseThrow(() -> new AppException("Bạn chưa có gian hàng. Vui lòng tạo gian hàng trước.",
                        HttpStatus.BAD_REQUEST));

        ProductCategory category = parseCategory(request.getCategory());
        FarmingMethod farmingMethod = parseFarmingMethod(request.getFarmingMethod());

        Product product = Product.builder()
                .shop(shop)
                .name(request.getName())
                .description(request.getDescription())
                .category(category)
                .unitCode(request.getUnitCode())
                .pricePerUnit(request.getPricePerUnit())
                .availableQuantity(request.getAvailableQuantity())
                .locationDetail(request.getLocationDetail())
                .harvestDate(request.getHarvestDate())
                .availableFrom(request.getAvailableFrom())
                .farmingMethod(farmingMethod)
                .pesticideFree(request.getPesticideFree() != null ? request.getPesticideFree() : false)
                .status(ProductStatus.UPCOMING)
                .build();

        return productMapper.toProductResponse(productRepository.save(product));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByShopSlug(String slug) {
        return productRepository.findByShopSlugAndStatusNot(slug, ProductStatus.HIDDEN).stream()
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
        return productRepository.findByStatusNot(ProductStatus.HIDDEN).stream()
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
        product.setCategory(parseCategory(request.getCategory()));
        product.setUnitCode(request.getUnitCode());
        product.setPricePerUnit(request.getPricePerUnit());
        product.setAvailableQuantity(request.getAvailableQuantity());
        product.setLocationDetail(request.getLocationDetail());
        product.setHarvestDate(request.getHarvestDate());
        product.setAvailableFrom(request.getAvailableFrom());
        product.setFarmingMethod(parseFarmingMethod(request.getFarmingMethod()));
        if (request.getPesticideFree() != null) {
            product.setPesticideFree(request.getPesticideFree());
        }

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

    @Override
    @Transactional
    public ProductResponse uploadProductImages(UUID productId, List<MultipartFile> files, String username) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (!product.getShop().getOwner().getUsername().equals(username)) {
            throw new AppException("Bạn không có quyền upload ảnh cho sản phẩm này", HttpStatus.FORBIDDEN);
        }

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

        // Refresh and return
        Product refreshed = productRepository.findById(productId).orElseThrow();
        return productMapper.toProductResponse(refreshed);
    }

    // ─── Helpers ────────────────────────────────────────

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
