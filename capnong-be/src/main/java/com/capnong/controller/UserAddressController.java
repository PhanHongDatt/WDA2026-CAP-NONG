package com.capnong.controller;

import com.capnong.dto.request.UserAddressRequest;
import com.capnong.dto.response.ApiResponse;
import com.capnong.dto.response.UserAddressResponse;
import com.capnong.security.UserDetailsImpl;
import com.capnong.service.UserAddressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users/me/addresses")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@Tag(name = "User Addresses", description = "Quản lý địa chỉ giao hàng đã lưu")
public class UserAddressController {

    private final UserAddressService addressService;

    @GetMapping
    @Operation(summary = "Danh sách địa chỉ đã lưu",
            description = "Trả về tất cả địa chỉ của user, sắp xếp địa chỉ mặc định lên đầu.")
    public ResponseEntity<ApiResponse<List<UserAddressResponse>>> getAddresses(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách địa chỉ thành công",
                addressService.getAddresses(userDetails.getId())));
    }

    @PostMapping
    @Operation(summary = "Thêm địa chỉ mới",
            description = "Tạo địa chỉ giao hàng mới. Tối đa 10 địa chỉ/user. Địa chỉ đầu tiên tự động là mặc định.")
    public ResponseEntity<ApiResponse<UserAddressResponse>> createAddress(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody UserAddressRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thêm địa chỉ thành công",
                        addressService.createAddress(userDetails.getId(), request)));
    }

    @PutMapping("/{addressId}")
    @Operation(summary = "Cập nhật địa chỉ",
            description = "Sửa thông tin một địa chỉ đã lưu. Nếu isDefault=true sẽ set làm mặc định.")
    public ResponseEntity<ApiResponse<UserAddressResponse>> updateAddress(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID addressId,
            @Valid @RequestBody UserAddressRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật địa chỉ thành công",
                addressService.updateAddress(userDetails.getId(), addressId, request)));
    }

    @DeleteMapping("/{addressId}")
    @Operation(summary = "Xóa địa chỉ",
            description = "Xóa một địa chỉ. Nếu xóa địa chỉ mặc định, hệ thống tự chọn địa chỉ khác làm mặc định.")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID addressId) {
        addressService.deleteAddress(userDetails.getId(), addressId);
        return ResponseEntity.ok(ApiResponse.success("Xóa địa chỉ thành công"));
    }

    @PatchMapping("/{addressId}/default")
    @Operation(summary = "Đặt làm địa chỉ mặc định",
            description = "Set một địa chỉ làm mặc định. Các địa chỉ khác tự động bỏ mặc định.")
    public ResponseEntity<ApiResponse<UserAddressResponse>> setDefault(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID addressId) {
        return ResponseEntity.ok(ApiResponse.success("Đã đặt làm địa chỉ mặc định",
                addressService.setDefault(userDetails.getId(), addressId)));
    }
}
