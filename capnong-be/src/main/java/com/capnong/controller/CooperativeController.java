package com.capnong.controller;

import com.capnong.dto.request.BundleCreateRequest;
import com.capnong.dto.request.PledgeRequest;
import com.capnong.dto.response.ApiResponse;
import com.capnong.dto.response.BundleResponseDto;
import com.capnong.dto.response.PledgeResponseDto;
import com.capnong.security.UserDetailsImpl;
import com.capnong.service.CooperativeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Cooperative", description = "Quản lý hợp tác xã và các chức năng gom đơn nông sản")
@RequestMapping("/api/v1/cooperatives")
public class CooperativeController {

    private final CooperativeService cooperativeService;

    public CooperativeController(CooperativeService cooperativeService) {
        this.cooperativeService = cooperativeService;
    }

    // ═══════════════════════════════════════════════════════════════
    //  BUNDLE — Public / Browse
    // ═══════════════════════════════════════════════════════════════

    /**
     * Danh sách bundles đang OPEN (buyer sỉ browse).
     */
    @GetMapping("/bundles")
    @Operation(summary = "Lấy danh sách gói gom đơn đang mở", description = "Dành cho người mua sỉ duyệt và xem các gói gom đơn nông sản đang ở trạng thái OPEN.")
    public ResponseEntity<ApiResponse<List<BundleResponseDto>>> getOpenBundles() {
        return ResponseEntity.ok(ApiResponse.success("OK", cooperativeService.getOpenBundles()));
    }

    /**
     * Chi tiết bundle + pledges + progress.
     */
    @GetMapping("/bundles/{id}")
    @Operation(summary = "Xem chi tiết gói gom đơn", description = "Truy xuất chi tiết của một gói gom đơn, bao gồm tiến trình và các cam kết (pledges) bên trong.")
    public ResponseEntity<ApiResponse<BundleResponseDto>> getBundle(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("OK", cooperativeService.getBundleById(id)));
    }

    /**
     * Bundles của 1 HTX_SHOP.
     */
    @GetMapping("/shops/{shopId}/bundles")
    @Operation(summary = "Lấy các gói gom đơn của HTX", description = "Lấy tất cả các bundles đã được tạo bởi một Hợp tác xã (HTX_SHOP) cụ thể.")
    public ResponseEntity<ApiResponse<List<BundleResponseDto>>> getShopBundles(@PathVariable UUID shopId) {
        return ResponseEntity.ok(ApiResponse.success("OK", cooperativeService.getShopBundles(shopId)));
    }

    // ═══════════════════════════════════════════════════════════════
    //  BUNDLE — Manager Actions
    // ═══════════════════════════════════════════════════════════════

    /**
     * HTX_MANAGER tạo Bundle mới.
     */
    @PostMapping("/bundles")
    @PreAuthorize("hasRole('HTX_MANAGER')")
    @Operation(summary = "Tạo gói gom đơn mới (Bundle)", description = "Dành cho tài khoản có quyền HTX_MANAGER để tạo một gói gom đơn nông sản mới từ các hộ nông dân.")
    public ResponseEntity<ApiResponse<BundleResponseDto>> createBundle(
            @Valid @RequestBody BundleCreateRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        BundleResponseDto result = cooperativeService.createBundle(request, userDetails.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo gói gom đơn thành công", result));
    }

    /**
     * HTX_MANAGER hủy Bundle.
     */
    @PutMapping("/bundles/{id}/cancel")
    @PreAuthorize("hasRole('HTX_MANAGER')")
    @Operation(summary = "Hủy gói gom đơn", description = "HTX_MANAGER hủy bỏ gói gom đơn. Sẽ tự động hoàn trả lại các cam kết của hộ nông dân nếu có.")
    public ResponseEntity<ApiResponse<BundleResponseDto>> cancelBundle(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        BundleResponseDto result = cooperativeService.cancelBundle(id, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Đã hủy gói gom đơn", result));
    }

    /**
     * HTX_MANAGER xác nhận Bundle đã đủ → tính doanh thu + tạo Product.
     */
    @PutMapping("/bundles/{id}/confirm")
    @PreAuthorize("hasRole('HTX_MANAGER')")
    @Operation(summary = "Xác nhận và chốt gói gom đơn", description = "HTX_MANAGER chốt gói gom đơn khi đã đạt đủ sản lượng mong muốn. Bundle sẽ tạo thành một Product mua chung.")
    public ResponseEntity<ApiResponse<BundleResponseDto>> confirmBundle(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        BundleResponseDto result = cooperativeService.confirmBundle(id, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Bundle đã xác nhận, product đã tạo", result));
    }

    // ═══════════════════════════════════════════════════════════════
    //  PLEDGE — Farmer / HTX_MEMBER Actions
    // ═══════════════════════════════════════════════════════════════

    /**
     * Farmer cam kết (pledge) sản lượng vào Bundle.
     */
    @PostMapping("/bundles/{bundleId}/pledges")
    @PreAuthorize("hasAnyRole('FARMER','HTX_MEMBER')")
    @Operation(summary = "Tham gia cam kết sản lượng (Pledge)", description = "Hộ nông dân điền cam kết muốn tham gia đóng góp sản lượng bao nhiêu kg/tấn vào gói gom đơn.")
    public ResponseEntity<ApiResponse<PledgeResponseDto>> addPledge(
            @PathVariable UUID bundleId,
            @Valid @RequestBody PledgeRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        PledgeResponseDto result = cooperativeService.createPledge(bundleId, request, userDetails.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Cam kết thành công", result));
    }

    /**
     * Farmer rút cam kết.
     */
    @DeleteMapping("/pledges/{pledgeId}")
    @PreAuthorize("hasAnyRole('FARMER','HTX_MEMBER')")
    @Operation(summary = "Rút lại cam kết (Pledge)", description = "Hộ nông dân hủy hoặc rút lại cam kết cung cấp sản lượng vào gói gom đơn hiện tại.")
    public ResponseEntity<ApiResponse<Void>> withdrawPledge(
            @PathVariable UUID pledgeId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        cooperativeService.withdrawPledge(pledgeId, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Đã rút cam kết", null));
    }

    /**
     * Pledges của farmer hiện tại.
     */
    @GetMapping("/my-pledges")
    @PreAuthorize("hasAnyRole('FARMER','HTX_MEMBER')")
    @Operation(summary = "Lấy các cam kết của tôi", description = "Lấy danh sách lịch sử tất cả các cam kết mà hộ nông dân này đã tham gia.")
    public ResponseEntity<ApiResponse<List<PledgeResponseDto>>> getMyPledges(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return ResponseEntity.ok(ApiResponse.success("OK", cooperativeService.getMyPledges(userDetails.getId())));
    }
}
