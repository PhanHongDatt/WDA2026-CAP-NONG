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
@Tag(name = "Product Management")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FARMER', 'HTX_MEMBER', 'HTX_MANAGER')")
    @Operation(summary = "Đăng bán sản phẩm mới", description = "Thêm một sản phẩm mới vào gian hàng của user hiện tại. Trạng thái mặc định là UPCOMING.")
    public ResponseEntity<ApiResponse<Object>> createProduct(
            @Valid @RequestBody ProductCreateRequest request,
            Authentication authentication) {
        var product = productService.createProduct(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thêm sản phẩm thành công", product));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FARMER', 'HTX_MEMBER', 'HTX_MANAGER')")
    @Operation(summary = "Xóa (Ẩn) sản phẩm", description = "Thực hiện xóa mềm (chuyển trạng thái sản phẩm sang HIDDEN) thay vì xóa hoàn toàn khỏi Database. Yêu cầu user là chủ sở hữu sản phẩm.")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @PathVariable UUID id,
            Authentication authentication) {
        productService.softDeleteProduct(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Sản phẩm đã được ẩn (xóa mềm) thành công"));
    }
}