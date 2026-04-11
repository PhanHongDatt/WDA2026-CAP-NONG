package com.capnong.controller;

import com.capnong.dto.request.HtxReviewRequest;
import com.capnong.dto.response.ApiResponse;
import com.capnong.dto.response.HtxResponse;
import com.capnong.service.HtxService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/htx-requests")
@Tag(name = "Admin - HTX Requests", description = "ADMIN xét duyệt đơn thành lập HTX")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class HtxAdminController {

    private final HtxService htxService;

    @GetMapping
    @Operation(summary = "Danh sách đơn thành lập HTX đang chờ duyệt")
    public ResponseEntity<ApiResponse<List<HtxResponse>>> getPendingRequests() {
        var list = htxService.getPendingHtxRequests();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đơn thành công", list));
    }

    @GetMapping("/all")
    @Operation(summary = "Xem tất cả HTX (mọi trạng thái)")
    public ResponseEntity<ApiResponse<List<HtxResponse>>> getAllHtx() {
        var list = htxService.getAllHtx();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách HTX thành công", list));
    }

    @GetMapping("/{htxId}")
    @Operation(summary = "Xem chi tiết HTX")
    public ResponseEntity<ApiResponse<HtxResponse>> getHtxDetail(@PathVariable UUID htxId) {
        var htx = htxService.getHtxById(htxId);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết HTX thành công", htx));
    }

    @PatchMapping("/{htxId}")
    @Operation(summary = "Xét duyệt HTX",
            description = "ADMIN chọn APPROVE hoặc REJECT. Nếu APPROVE → creator trở thành HTX_MANAGER, HTX status = ACTIVE.")
    public ResponseEntity<ApiResponse<HtxResponse>> reviewHtx(
            @PathVariable UUID htxId,
            @Valid @RequestBody HtxReviewRequest request) {
        var htx = htxService.reviewHtx(htxId, request);
        return ResponseEntity.ok(ApiResponse.success("Xét duyệt HTX thành công", htx));
    }
}
