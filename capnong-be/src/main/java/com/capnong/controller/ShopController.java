package com.capnong.controller;

import com.capnong.dto.request.ShopCreateRequest;
import com.capnong.dto.response.ApiResponse;
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
@Tag(name = "Shop Management")
public class ShopController {
    private final ShopService shopService;
    private final ProductService productService;

    public ShopController(ShopService shopService, ProductService productService) {
        this.shopService = shopService;
        this.productService = productService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FARMER', 'HTX_MEMBER', 'HTX_MANAGER')")
    @Operation(summary = "Tạo gian hàng mới", description = "Yêu cầu quyền bán hàng (FARMER trở lên). Mỗi user chỉ được phép có tối đa 1 gian hàng.")
    public ResponseEntity<ApiResponse<Object>> createShop(
            @Valid @RequestBody ShopCreateRequest request,
            Authentication authentication) {
        var shop = shopService.createShop(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo gian hàng thành công", shop));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Xem chi tiết gian hàng", description = "Lấy thông tin công khai của gian hàng dựa trên slug (đường dẫn). API này public.")
    public ResponseEntity<ApiResponse<Object>> getShop(@PathVariable String slug) {
        var shop = shopService.getShopBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin gian hàng thành công", shop));
    }

    @PutMapping("/{slug}")
    @PreAuthorize("hasAnyRole('FARMER', 'HTX_MEMBER', 'HTX_MANAGER')")
    @Operation(summary = "Cập nhật thông tin gian hàng", description = "Cập nhật các thông tin cơ bản của gian hàng. Yêu cầu user đang gọi API phải là chủ sở hữu (owner) của gian hàng này.")
    public ResponseEntity<ApiResponse<Object>> updateShop(
            @PathVariable String slug,
            @Valid @RequestBody ShopCreateRequest request,
            Authentication authentication) {
        var shop = shopService.updateShop(slug, request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật gian hàng thành công", shop));
    }

    @GetMapping("/{slug}/products")
    @Operation(summary = "Lấy danh sách sản phẩm của gian hàng", description = "Hiển thị tất cả sản phẩm đang bán tại gian hàng (đã tự động loại trừ các sản phẩm bị ẩn). API public.")
    public ResponseEntity<ApiResponse<Object>> getShopProducts(@PathVariable String slug) {
        var products = productService.getProductsByShopSlug(slug);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm thành công", products));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('FARMER', 'HTX_MEMBER', 'HTX_MANAGER')")
    @Operation(summary = "Xem gian hàng của tôi", description = "Lấy thông tin gian hàng của user đang đăng nhập.")
    public ResponseEntity<ApiResponse<Object>> getMyShop(Authentication authentication) {
        var shop = shopService.getMyShop(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin gian hàng thành công", shop));
    }

    @DeleteMapping("/{slug}")
    @PreAuthorize("hasAnyRole('FARMER', 'HTX_MEMBER', 'HTX_MANAGER')")
    @Operation(summary = "Xóa gian hàng (soft delete)", description = "Xóa mềm gian hàng. Yêu cầu user là chủ sở hữu.")
    public ResponseEntity<ApiResponse<Void>> deleteShop(
            @PathVariable String slug,
            Authentication authentication) {
        shopService.softDeleteShop(slug, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Xóa gian hàng thành công"));
    }
}