package com.capnong.controller;

import com.capnong.dto.request.ProductCreateRequest;
import com.capnong.dto.response.ApiResponse;
import com.capnong.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Product Management", description = "Quản lý sản phẩm nông sản")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    @Operation(summary = "Danh sách sản phẩm công khai", description = "Trả về tất cả sản phẩm đang bán (trừ HIDDEN). API public.")
    public ResponseEntity<ApiResponse<Object>> getAllProducts() {
        var products = productService.getAllPublicProducts();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm thành công", products));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết sản phẩm", description = "Xem chi tiết một sản phẩm theo ID. API public.")
    public ResponseEntity<ApiResponse<Object>> getProduct(@PathVariable UUID id) {
        var product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin sản phẩm thành công", product));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FARMER', 'HTX_MEMBER', 'HTX_MANAGER')")
    @Operation(summary = "Đăng bán sản phẩm mới", description = "Thêm sản phẩm mới vào gian hàng. Trạng thái mặc định UPCOMING.")
    public ResponseEntity<ApiResponse<Object>> createProduct(
            @Valid @RequestBody ProductCreateRequest request,
            Authentication authentication) {
        var product = productService.createProduct(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thêm sản phẩm thành công", product));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FARMER', 'HTX_MEMBER', 'HTX_MANAGER')")
    @Operation(summary = "Cập nhật sản phẩm", description = "Chỉnh sửa thông tin sản phẩm. Yêu cầu user là chủ sở hữu.")
    public ResponseEntity<ApiResponse<Object>> updateProduct(
            @PathVariable UUID id,
            @Valid @RequestBody ProductCreateRequest request,
            Authentication authentication) {
        var product = productService.updateProduct(id, request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật sản phẩm thành công", product));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FARMER', 'HTX_MEMBER', 'HTX_MANAGER')")
    @Operation(summary = "Xóa sản phẩm (soft delete)", description = "Xóa mềm sản phẩm. Yêu cầu user là chủ sở hữu.")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @PathVariable UUID id,
            Authentication authentication) {
        productService.softDeleteProduct(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Sản phẩm đã được xóa thành công"));
    }
}