package com.capnong.controller;

import com.capnong.dto.response.ProvinceResponse;
import com.capnong.dto.response.WardResponse;
import com.capnong.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public endpoints cho danh mục địa chỉ Việt Nam.
 * FE dùng để render select box Tỉnh/TP → Xã/Phường.
 */
@RestController
@RequestMapping("/api/address")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    /**
     * Lấy danh sách tất cả Tỉnh/Thành phố.
     * GET /api/address/provinces
     */
    @GetMapping("/provinces")
    public ResponseEntity<List<ProvinceResponse>> getProvinces() {
        return ResponseEntity.ok(addressService.getAllProvinces());
    }

    /**
     * Lấy danh sách Xã/Phường theo mã Tỉnh/TP.
     * GET /api/address/provinces/{provinceCode}/wards
     */
    @GetMapping("/provinces/{provinceCode}/wards")
    public ResponseEntity<List<WardResponse>> getWards(@PathVariable Integer provinceCode) {
        return ResponseEntity.ok(addressService.getWardsByProvince(provinceCode));
    }
}
