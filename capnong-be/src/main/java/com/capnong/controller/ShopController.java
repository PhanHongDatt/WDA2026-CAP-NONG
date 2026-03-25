package com.capnong.controller;

import com.capnong.dto.response.ApiResponse;
import com.capnong.model.Product;
import com.capnong.model.Shop;
import com.capnong.repository.ProductRepository;
import com.capnong.security.UserDetailsImpl;
import com.capnong.service.ShopService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/shops")
public class ShopController {

    private final ShopService shopService;
    private final ProductRepository productRepository;

    public ShopController(ShopService shopService, ProductRepository productRepository) {
        this.shopService = shopService;
        this.productRepository = productRepository;
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<Shop>> getShop(@PathVariable String slug) {
        Shop shop = shopService.getBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success("OK", shop));
    }

    @GetMapping("/{slug}/products")
    public ResponseEntity<ApiResponse<List<Product>>> getShopProducts(@PathVariable String slug) {
        Shop shop = shopService.getBySlug(slug);
        List<Product> products = productRepository.findVisibleByShopId(shop.getId());
        return ResponseEntity.ok(ApiResponse.success("OK", products));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FARMER','HTX_MEMBER','HTX_MANAGER')")
    public ResponseEntity<ApiResponse<Shop>> createShop(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Shop shop) {
        Shop created = shopService.createShop(userDetails.getId(), shop);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo gian hàng thành công", created));
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('FARMER','HTX_MEMBER','HTX_MANAGER')")
    public ResponseEntity<ApiResponse<Shop>> updateShop(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Shop updates) {
        Shop updated = shopService.updateShop(userDetails.getId(), updates);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật gian hàng thành công", updated));
    }
}
