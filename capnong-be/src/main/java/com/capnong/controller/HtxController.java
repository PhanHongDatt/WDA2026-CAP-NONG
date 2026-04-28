package com.capnong.controller;

import com.capnong.dto.request.HtxCreateRequest;
import com.capnong.dto.request.HtxJoinRequestDto;
import com.capnong.dto.request.JoinRequestReviewDto;
import com.capnong.dto.response.ApiResponse;
import com.capnong.dto.response.HtxJoinRequestResponse;
import com.capnong.dto.response.HtxResponse;
import com.capnong.dto.response.UserResponse;
import com.capnong.service.HtxService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/htx")
@Tag(name = "HTX Management", description = "Quản lý Hợp tác xã")
@RequiredArgsConstructor
public class HtxController {

    private final HtxService htxService;

    // ─── Public ─────────────────────────────────────────────

    @GetMapping
    @Operation(summary = "Danh sách HTX đang hoạt động (public)")
    public ResponseEntity<ApiResponse<List<HtxResponse>>> getActiveHtxList() {
        var list = htxService.getActiveHtxList();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách HTX thành công", list));
    }

    @GetMapping("/{htxId}")
    @Operation(summary = "Xem chi tiết HTX (public)")
    public ResponseEntity<ApiResponse<HtxResponse>> getHtx(@PathVariable UUID htxId) {
        var htx = htxService.getHtxById(htxId);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin HTX thành công", htx));
    }

    // ─── FARMER: Tạo HTX ────────────────────────────────────

    @PostMapping(value = "/upload-document", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyRole('FARMER', 'HTX_MANAGER')")
    @Operation(summary = "Upload tài liệu HTX", description = "Dành cho Farmer (chuẩn bị tạo HTX) hoặc HTX_MANAGER để lấy URL tài liệu.")
    public ResponseEntity<ApiResponse<String>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            Authentication auth) {
        String url = htxService.uploadDocument(file, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Upload tài liệu thành công", url));
    }

    @PostMapping
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "Tạo đơn thành lập HTX",
            description = "FARMER gửi đơn thành lập HTX. Status ban đầu: PENDING. ADMIN sẽ xét duyệt.")
    public ResponseEntity<ApiResponse<HtxResponse>> createHtx(
            @Valid @RequestBody HtxCreateRequest request,
            Authentication auth) {
        var htx = htxService.createHtx(request, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Gửi đơn thành lập HTX thành công, đang chờ xét duyệt", htx));
    }

    // ─── FARMER: Gia nhập HTX ───────────────────────────────

    @PostMapping("/{htxId}/join")
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "Gửi yêu cầu gia nhập HTX",
            description = "FARMER gửi yêu cầu gia nhập một HTX đang ACTIVE. 1 farmer chỉ thuộc 1 HTX cùng lúc.")
    public ResponseEntity<ApiResponse<HtxJoinRequestResponse>> requestToJoin(
            @PathVariable UUID htxId,
            @RequestBody(required = false) HtxJoinRequestDto request,
            Authentication auth) {
        if (request == null) request = new HtxJoinRequestDto();
        var joinRequest = htxService.requestToJoin(htxId, request, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Gửi yêu cầu gia nhập thành công, đang chờ duyệt", joinRequest));
    }

    @GetMapping("/my-join-requests")
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "Lấy danh sách yêu cầu gia nhập của bản thân",
            description = "FARMER xem lại các yêu cầu gia nhập mình đã gửi (đang chờ duyệt, bị từ chối, v.v.).")
    public ResponseEntity<ApiResponse<List<HtxJoinRequestResponse>>> getMyJoinRequests(Authentication auth) {
        var list = htxService.getMyJoinRequests(auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách yêu cầu gia nhập thành công", list));
    }


    // ─── HTX_MEMBER: Rời HTX ────────────────────────────────

    @PostMapping("/leave")
    @PreAuthorize("hasRole('HTX_MEMBER')")
    @Operation(summary = "Rời HTX",
            description = "HTX_MEMBER tự rời HTX. Sau khi rời sẽ quay về role FARMER.")
    public ResponseEntity<ApiResponse<Void>> leaveHtx(Authentication auth) {
        htxService.leaveHtx(auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Bạn đã rời HTX thành công"));
    }

    // ─── HTX_MEMBER / HTX_MANAGER: Xem HTX của mình ─────────

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('HTX_MEMBER', 'HTX_MANAGER')")
    @Operation(summary = "Xem HTX của tôi")
    public ResponseEntity<ApiResponse<HtxResponse>> getMyHtx(Authentication auth) {
        var htx = htxService.getMyHtx(auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin HTX thành công", htx));
    }

    // ─── HTX_MANAGER: Quản lý thành viên ────────────────────

    @GetMapping("/members")
    @PreAuthorize("hasAnyRole('HTX_MEMBER', 'HTX_MANAGER')")
    @Operation(summary = "Danh sách thành viên HTX")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getMyHtxMembers(Authentication auth) {
        var members = htxService.getMyHtxMembers(auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách thành viên thành công", members));
    }

    @GetMapping("/join-requests")
    @PreAuthorize("hasRole('HTX_MANAGER')")
    @Operation(summary = "Danh sách đơn xin gia nhập (PENDING)")
    public ResponseEntity<ApiResponse<List<HtxJoinRequestResponse>>> getPendingJoinRequests(Authentication auth) {
        var list = htxService.getPendingJoinRequests(auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đơn thành công", list));
    }

    @PatchMapping("/join-requests/{requestId}")
    @PreAuthorize("hasRole('HTX_MANAGER')")
    @Operation(summary = "Duyệt/Từ chối đơn gia nhập",
            description = "HTX_MANAGER chọn APPROVE hoặc REJECT cho đơn gia nhập.")
    public ResponseEntity<ApiResponse<HtxJoinRequestResponse>> reviewJoinRequest(
            @PathVariable UUID requestId,
            @Valid @RequestBody JoinRequestReviewDto review,
            Authentication auth) {
        var result = htxService.reviewJoinRequest(requestId, review, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Xử lý đơn gia nhập thành công", result));
    }

    @DeleteMapping("/members/{memberId}")
    @PreAuthorize("hasRole('HTX_MANAGER')")
    @Operation(summary = "Xóa thành viên khỏi HTX",
            description = "HTX_MANAGER xóa HTX_MEMBER. Member sẽ quay về role FARMER.")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable UUID memberId,
            Authentication auth) {
        htxService.removeMember(memberId, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Đã xóa thành viên khỏi HTX"));
    }

    // ─── HTX_MANAGER: Chuyển quyền & Giải tán ───────────────

    @PatchMapping("/transfer")
    @PreAuthorize("hasRole('HTX_MANAGER')")
    @Operation(summary = "Chuyển quyền Chủ HTX",
            description = "Chuyển quyền quản lý HTX cho một HTX_MEMBER. Chủ cũ trở thành HTX_MEMBER.")
    public ResponseEntity<ApiResponse<Void>> transferOwnership(
            @RequestBody java.util.Map<String, String> body,
            Authentication auth) {
        String newManagerId = body.get("new_manager_id");
        if (newManagerId == null || newManagerId.isBlank()) {
            throw new com.capnong.exception.AppException("Thiếu new_manager_id", org.springframework.http.HttpStatus.BAD_REQUEST);
        }
        htxService.transferOwnership(UUID.fromString(newManagerId), auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Đã chuyển quyền Chủ HTX thành công"));
    }

    @DeleteMapping("/dissolve")
    @PreAuthorize("hasRole('HTX_MANAGER')")
    @Operation(summary = "Giải tán HTX",
            description = "Giải tán HTX. Tất cả thành viên quay về FARMER. HTX chuyển trạng thái DISSOLVED.")
    public ResponseEntity<ApiResponse<Void>> dissolveHtx(Authentication auth) {
        htxService.dissolveHtx(auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Đã giải tán HTX thành công"));
    }
}
