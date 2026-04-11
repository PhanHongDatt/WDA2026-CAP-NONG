package com.capnong.controller;

import com.capnong.dto.response.ApiResponse;
import com.capnong.dto.response.UnitResponse;
import com.capnong.service.UnitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/units")
@RequiredArgsConstructor
@Tag(name = "Units", description = "Quản lý đơn vị tính")
public class UnitController {

    private final UnitService unitService;

    @GetMapping
    @Operation(summary = "Danh sách đơn vị tính", description = "Lấy tất cả đơn vị tính. API public.")
    public ResponseEntity<ApiResponse<List<UnitResponse>>> getAllUnits() {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đơn vị thành công", unitService.getAllUnits()));
    }

    @GetMapping("/{code}")
    @Operation(summary = "Chi tiết đơn vị tính", description = "Lấy thông vị tính theo code.")
    public ResponseEntity<ApiResponse<UnitResponse>> getUnitByCode(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin đơn vị thành công", unitService.getByCode(code)));
    }

    @org.springframework.web.bind.annotation.PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo đơn vị tính", description = "Yêu cầu quyền ADMIN.")
    public ResponseEntity<ApiResponse<UnitResponse>> createUnit(@jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody com.capnong.dto.request.UnitCreateRequest request) {
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo đơn vị tính thành công", unitService.createUnit(request)));
    }

    @org.springframework.web.bind.annotation.PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật đơn vị tính", description = "Yêu cầu quyền ADMIN.")
    public ResponseEntity<ApiResponse<UnitResponse>> updateUnit(
            @PathVariable java.util.UUID id, 
            @jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody com.capnong.dto.request.UnitUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật đơn vị tính thành công", unitService.updateUnit(id, request)));
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa đơn vị tính", description = "Xóa mềm đơn vị tính. Yêu cầu quyền ADMIN.")
    public ResponseEntity<ApiResponse<Void>> deleteUnit(@PathVariable java.util.UUID id) {
        unitService.deleteUnit(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa đơn vị tính thành công"));
    }
}
