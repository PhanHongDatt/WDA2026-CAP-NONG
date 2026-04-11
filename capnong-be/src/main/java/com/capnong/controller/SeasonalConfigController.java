package com.capnong.controller;

import com.capnong.dto.request.SeasonalConfigRequest;
import com.capnong.dto.response.ApiResponse;
import com.capnong.dto.response.SeasonalConfigResponse;
import com.capnong.service.SeasonalConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/seasonal-configs")
@RequiredArgsConstructor
@Tag(name = "Seasonal Config", description = "Cấu hình mùa vụ theo tỉnh/danh mục")
public class SeasonalConfigController {

    private final SeasonalConfigService seasonalConfigService;

    @GetMapping
    @Operation(summary = "Danh sách cấu hình mùa vụ")
    public ResponseEntity<ApiResponse<List<SeasonalConfigResponse>>> getAllConfigs() {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách cấu hình mùa vụ thành công",
                seasonalConfigService.getAllConfigs()));
    }

    @GetMapping("/province/{province}")
    @Operation(summary = "Cấu hình mùa vụ theo tỉnh")
    public ResponseEntity<ApiResponse<List<SeasonalConfigResponse>>> getByProvince(@PathVariable String province) {
        return ResponseEntity.ok(ApiResponse.success("Lấy cấu hình mùa vụ thành công",
                seasonalConfigService.getConfigsByProvince(province)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('HTX_MANAGER', 'ADMIN')")
    @Operation(summary = "Tạo cấu hình mùa vụ", description = "HTX_MANAGER hoặc ADMIN tạo config mùa vụ")
    public ResponseEntity<ApiResponse<SeasonalConfigResponse>> createConfig(
            @Valid @RequestBody SeasonalConfigRequest request,
            Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        var config = seasonalConfigService.createConfig(request, authentication.getName(), isAdmin);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo cấu hình mùa vụ thành công", config));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('HTX_MANAGER', 'ADMIN')")
    @Operation(summary = "Cập nhật cấu hình mùa vụ")
    public ResponseEntity<ApiResponse<SeasonalConfigResponse>> updateConfig(
            @PathVariable UUID id,
            @Valid @RequestBody SeasonalConfigRequest request,
            Authentication authentication) {
        var config = seasonalConfigService.updateConfig(id, request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật cấu hình mùa vụ thành công", config));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa cấu hình mùa vụ")
    public ResponseEntity<ApiResponse<Void>> deleteConfig(
            @PathVariable UUID id,
            Authentication authentication) {
        seasonalConfigService.deleteConfig(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Xóa cấu hình mùa vụ thành công"));
    }

    @PostMapping("/trigger-update")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Kích hoạt thủ công cập nhật trạng thái mùa vụ", description = "Chạy logic cron thủ công")
    public ResponseEntity<ApiResponse<Void>> triggerUpdate() {
        seasonalConfigService.runSeasonalStatusUpdate();
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật trạng thái sản phẩm thành công"));
    }
}
