package com.capnong.controller;

import com.capnong.dto.request.ShopCreateRequest;
import com.capnong.dto.response.ApiResponse;
import com.capnong.dto.response.ShopResponse;
import com.capnong.service.ProductService;
import com.capnong.service.ShopService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shops")
@Tag(name = "Shop Management", description = "Quản lý gian hàng nông sản")
public class ShopController {
    private final ShopService shopService;
    private final ProductService productService;

    public ShopController(ShopService shopService, ProductService productService) {
        this.shopService = shopService;
        this.productService = productService;
    }

    @PostMapping
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "Tạo gian hàng mới",
            description = "FARMER tạo gian hàng (1 account = 1 shop). Sau khi tạo, shop_slug sẽ xuất hiện trong JWT ở lần đăng nhập/refresh tiếp theo.")
    public ResponseEntity<ApiResponse<ShopResponse>> createShop(
            @Valid @RequestBody ShopCreateRequest request,
            Authentication authentication) {
        ShopResponse shop = shopService.createShop(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo gian hàng thành công", shop));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "Xem gian hàng của tôi",
            description = "Lấy thông tin gian hàng của user đang đăng nhập.")
    public ResponseEntity<ApiResponse<ShopResponse>> getMyShop(Authentication authentication) {
        ShopResponse shop = shopService.getMyShop(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin gian hàng thành công", shop));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Xem chi tiết gian hàng (public)",
            description = "Lấy thông tin công khai của gian hàng dựa trên slug.")
    public ResponseEntity<ApiResponse<ShopResponse>> getShop(@PathVariable String slug) {
        ShopResponse shop = shopService.getShopBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin gian hàng thành công", shop));
    }

    @PutMapping("/{slug}")
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "Cập nhật gian hàng",
            description = "Cập nhật thông tin gian hàng. Yêu cầu user phải là chủ sở hữu.")
    public ResponseEntity<ApiResponse<ShopResponse>> updateShop(
            @PathVariable String slug,
            @Valid @RequestBody ShopCreateRequest request,
            Authentication authentication) {
        ShopResponse shop = shopService.updateShop(slug, request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật gian hàng thành công", shop));
    }

    @DeleteMapping("/{slug}")
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "Xóa gian hàng (soft delete)",
            description = "Xóa mềm gian hàng. Yêu cầu user là chủ sở hữu.")
    public ResponseEntity<ApiResponse<Void>> deleteShop(
            @PathVariable String slug,
            Authentication authentication) {
        shopService.softDeleteShop(slug, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Xóa gian hàng thành công"));
    }

    @GetMapping("/{slug}/products")
    @Operation(summary = "Danh sách sản phẩm của gian hàng (public)",
            description = "Hiển thị tất cả sản phẩm đang bán tại gian hàng.")
    public ResponseEntity<ApiResponse<Object>> getShopProducts(@PathVariable String slug) {
        var products = productService.getProductsByShopSlug(slug);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm thành công", products));
    }
}