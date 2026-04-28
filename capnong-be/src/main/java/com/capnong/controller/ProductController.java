package com.capnong.controller;

import com.capnong.dto.request.ProductCreateRequest;
import com.capnong.dto.request.ProductFilterParams;
import com.capnong.dto.response.ApiResponse;
import com.capnong.dto.response.PagedResponse;
import com.capnong.dto.response.ProductResponse;
import com.capnong.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Product Management", description = "Quản lý sản phẩm nông sản")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // ═══════════════════════════════════════════════════════════════
    //  SEARCH / LIST (Paginated + Filtered)
    // ═══════════════════════════════════════════════════════════════

    @GetMapping
    @Operation(summary = "Tìm kiếm sản phẩm",
            description = "Tìm kiếm + lọc sản phẩm với pagination. "
                    + "Params: keyword, category, province, minPrice, maxPrice, "
                    + "farmingMethod, status, pesticideFree, shopId, shopSlug. "
                    + "Sort: sort=pricePerUnit,asc hoặc sort=createdAt,desc")
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> searchProducts(
            @ModelAttribute ProductFilterParams filter,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {

        Page<ProductResponse> page = productService.searchProducts(filter, pageable);
        return ResponseEntity.ok(ApiResponse.success("OK", PagedResponse.from(page)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết sản phẩm", description = "Xem chi tiết một sản phẩm theo ID. API public.")
    public ResponseEntity<ApiResponse<ProductResponse>> getProduct(@PathVariable UUID id) {
        var product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin sản phẩm thành công", product));
    }

    @GetMapping("/seller")
    @PreAuthorize("hasAnyRole('FARMER', 'HTX_MEMBER', 'HTX_MANAGER')")
    @Operation(summary = "Danh sách sản phẩm của tôi", description = "Lấy tất cả sản phẩm của Nông dân (Seller) đang đăng nhập, bất kể trạng thái (HIDDEN, OUT_OF_STOCK...). Dùng cho trang Quản lý Sản phẩm.")
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> getSellerProducts(
            Authentication authentication,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        var page = productService.getSellerProducts(authentication.getName(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm thành công", PagedResponse.from(page)));
    }

    // ═══════════════════════════════════════════════════════════════
    //  CREATE
    // ═══════════════════════════════════════════════════════════════

    @PostMapping
    @PreAuthorize("hasAnyRole('FARMER', 'HTX_MEMBER', 'HTX_MANAGER')")
    @Operation(summary = "Đăng bán sản phẩm mới", description = "Thêm sản phẩm mới vào gian hàng. Trạng thái mặc định UPCOMING.")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @RequestBody ProductCreateRequest request,
            Authentication authentication) {
        var product = productService.createProduct(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thêm sản phẩm thành công", product));
    }

    // ═══════════════════════════════════════════════════════════════
    //  UPDATE (full)
    // ═══════════════════════════════════════════════════════════════

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FARMER', 'HTX_MEMBER', 'HTX_MANAGER')")
    @Operation(summary = "Cập nhật sản phẩm", description = "Chỉnh sửa toàn bộ thông tin sản phẩm. Yêu cầu user là chủ sở hữu.")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable UUID id,
            @Valid @RequestBody ProductCreateRequest request,
            Authentication authentication) {
        var product = productService.updateProduct(id, request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật sản phẩm thành công", product));
    }

    // ═══════════════════════════════════════════════════════════════
    //  PATCH — Quick updates
    // ═══════════════════════════════════════════════════════════════

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('FARMER', 'HTX_MEMBER', 'HTX_MANAGER')")
    @Operation(summary = "Cập nhật trạng thái sản phẩm",
            description = "Đổi nhanh status: IN_SEASON, UPCOMING, OFF_SEASON, OUT_OF_STOCK, HIDDEN")
    public ResponseEntity<ApiResponse<ProductResponse>> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        var product = productService.updateStatus(id, body.get("status"), authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thành công", product));
    }

    @PatchMapping("/{id}/price")
    @PreAuthorize("hasAnyRole('FARMER', 'HTX_MEMBER', 'HTX_MANAGER')")
    @Operation(summary = "Cập nhật giá sản phẩm", description = "Chỉnh nhanh giá/đơn vị.")
    public ResponseEntity<ApiResponse<ProductResponse>> updatePrice(
            @PathVariable UUID id,
            @RequestBody Map<String, BigDecimal> body,
            Authentication authentication) {
        var product = productService.updatePrice(id, body.get("price"), authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật giá thành công", product));
    }

    @PatchMapping("/{id}/quantity")
    @PreAuthorize("hasAnyRole('FARMER', 'HTX_MEMBER', 'HTX_MANAGER')")
    @Operation(summary = "Cập nhật sản lượng", description = "Chỉnh nhanh sản lượng có sẵn. Tự động OUT_OF_STOCK nếu = 0.")
    public ResponseEntity<ApiResponse<ProductResponse>> updateQuantity(
            @PathVariable UUID id,
            @RequestBody Map<String, BigDecimal> body,
            Authentication authentication) {
        var product = productService.updateQuantity(id, body.get("quantity"), authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật sản lượng thành công", product));
    }

    // ═══════════════════════════════════════════════════════════════
    //  DELETE
    // ═══════════════════════════════════════════════════════════════

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FARMER', 'HTX_MEMBER', 'HTX_MANAGER')")
    @Operation(summary = "Xóa sản phẩm (soft delete)", description = "Xóa mềm sản phẩm. Yêu cầu user là chủ sở hữu.")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @PathVariable UUID id,
            Authentication authentication) {
        productService.softDeleteProduct(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Sản phẩm đã được xóa thành công"));
    }

    // ═══════════════════════════════════════════════════════════════
    //  IMAGES
    // ═══════════════════════════════════════════════════════════════

    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('FARMER', 'HTX_MEMBER', 'HTX_MANAGER')")
    @Operation(summary = "Upload ảnh sản phẩm", description = "Tải lên ảnh cho sản phẩm. Tối đa 10 ảnh.")
    public ResponseEntity<ApiResponse<ProductResponse>> uploadImages(
            @PathVariable UUID id,
            @RequestParam("files") List<MultipartFile> files,
            Authentication authentication) {
        var product = productService.uploadProductImages(id, files, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Upload ảnh sản phẩm thành công", product));
    }

    @DeleteMapping("/{productId}/images/{imageId}")
    @PreAuthorize("hasAnyRole('FARMER', 'HTX_MEMBER', 'HTX_MANAGER')")
    @Operation(summary = "Xóa 1 ảnh sản phẩm", description = "Xóa ảnh theo imageId.")
    public ResponseEntity<ApiResponse<Void>> deleteImage(
            @PathVariable UUID productId,
            @PathVariable UUID imageId,
            Authentication authentication) {
        productService.deleteProductImage(productId, imageId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Đã xóa ảnh"));
    }

    @DeleteMapping("/{productId}/images")
    @PreAuthorize("hasAnyRole('FARMER', 'HTX_MEMBER', 'HTX_MANAGER')")
    @Operation(summary = "Xóa nhiều ảnh sản phẩm", description = "Truyền danh sách imageIds qua query param.")
    public ResponseEntity<ApiResponse<Void>> deleteImages(
            @PathVariable UUID productId,
            @RequestParam("ids") List<UUID> imageIds,
            Authentication authentication) {
        productService.deleteProductImages(productId, imageIds, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Đã xóa " + imageIds.size() + " ảnh"));
    }

    @PutMapping("/{productId}/images/sort")
    @PreAuthorize("hasAnyRole('FARMER', 'HTX_MEMBER', 'HTX_MANAGER')")
    @Operation(summary = "Cập nhật thứ tự ảnh", description = "Truyền danh sách imageIds theo đúng thứ tự hiển thị.")
    public ResponseEntity<ApiResponse<Void>> updateImageOrder(
            @PathVariable UUID productId,
            @RequestBody List<UUID> imageIds,
            Authentication authentication) {
        productService.updateImageSortOrder(productId, imageIds, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thứ tự ảnh thành công"));
    }
}