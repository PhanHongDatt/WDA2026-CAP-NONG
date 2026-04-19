package com.capnong.controller;

import com.capnong.dto.response.ProvinceResponse;
import com.capnong.dto.response.WardResponse;
import com.capnong.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Public endpoints cho danh mục địa chỉ Việt Nam.
 * FE dùng để render select box Tỉnh/TP → Xã/Phường.
 */
@RestController
@Tag(name = "Address", description = "Quản lý dữ liệu địa chỉ Tỉnh/Thành phố, Quận/Huyện, Phường/Xã")
@RequestMapping("/api/address")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    /**
     * Lấy danh sách tất cả Tỉnh/Thành phố.
     * GET /api/address/provinces
     */
    @GetMapping("/provinces")
    @Operation(summary = "Lấy danh sách Tỉnh/Thành phố", description = "Lấy tất cả các tỉnh thành phố tại Việt Nam để hiển thị trên form điều hướng hoặc địa chỉ.")
    public ResponseEntity<List<ProvinceResponse>> getProvinces() {
        return ResponseEntity.ok(addressService.getAllProvinces());
    }

    /**
     * Lấy danh sách Xã/Phường theo mã Tỉnh/TP.
     * GET /api/address/provinces/{provinceCode}/wards
     */
    @GetMapping("/provinces/{provinceCode}/wards")
    @Operation(summary = "Lấy danh sách Quận/Huyện/Xã", description = "Lấy danh sách các đơn vị hành chính cấp dưới tương ứng với tỉnh thành được chọn.")
    public ResponseEntity<List<WardResponse>> getWards(@PathVariable Integer provinceCode) {
        return ResponseEntity.ok(addressService.getWardsByProvince(provinceCode));
    }
}
