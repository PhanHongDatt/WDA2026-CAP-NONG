package com.capnong.controller;

import com.capnong.dto.response.ApiResponse;
import com.capnong.model.Product;
import com.capnong.model.ProductImage;
import com.capnong.model.enums.ProductCategory;
import com.capnong.model.enums.ProductStatus;
import com.capnong.security.UserDetailsImpl;
import com.capnong.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Product>>> searchProducts(
            @RequestParam(required = false) ProductCategory category,
            @RequestParam(required = false) ProductStatus status,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 20, sort = "created_at", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<Product> products = productService.search(category, status, minPrice, maxPrice, keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success("OK", products));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProduct(@PathVariable UUID id) {
        Product product = productService.getById(id);
        List<ProductImage> images = productService.getImages(id);
        return ResponseEntity.ok(ApiResponse.success("OK",
                Map.of("product", product, "images", images)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FARMER','HTX_MEMBER','HTX_MANAGER')")
    public ResponseEntity<ApiResponse<Product>> createProduct(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, Object> body) {
        // Parse product from body
        Product product = Product.builder()
                .name((String) body.get("name"))
                .description((String) body.get("description"))
                .category(ProductCategory.valueOf((String) body.get("category")))
                .unitCode((String) body.get("unitCode"))
                .pricePerUnit(new BigDecimal(body.get("pricePerUnit").toString()))
                .availableQuantity(new BigDecimal(body.get("availableQuantity").toString()))
                .locationDetail((String) body.get("locationDetail"))
                .build();

        if (body.containsKey("farmingMethod"))
            product.setFarmingMethod(com.capnong.model.enums.FarmingMethod.valueOf((String) body.get("farmingMethod")));
        if (body.containsKey("pesticideFree"))
            product.setPesticideFree((Boolean) body.get("pesticideFree"));

        @SuppressWarnings("unchecked")
        List<String> imageUrls = (List<String>) body.get("imageUrls");

        Product created = productService.create(userDetails.getId(), product, imageUrls);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đăng sản phẩm thành công", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FARMER','HTX_MEMBER','HTX_MANAGER')")
    public ResponseEntity<ApiResponse<Product>> updateProduct(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Product updates) {
        Product updated = productService.update(id, userDetails.getId(), updates);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật sản phẩm thành công", updated));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('FARMER','HTX_MEMBER','HTX_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, String> body) {
        ProductStatus status = ProductStatus.valueOf(body.get("status"));
        productService.updateStatus(id, userDetails.getId(), status);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thành công", null));
    }
}
