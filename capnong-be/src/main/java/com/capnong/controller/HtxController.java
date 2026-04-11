package com.capnong.controller;

import com.capnong.dto.response.ApiResponse;
import com.capnong.exception.AppException;
import com.capnong.model.Htx;
import com.capnong.model.HtxJoinRequest;
import com.capnong.model.User;
import com.capnong.model.enums.HtxStatus;
import com.capnong.model.enums.JoinRequestStatus;
import com.capnong.model.enums.Role;
import com.capnong.repository.HtxJoinRequestRepository;
import com.capnong.repository.HtxRepository;
import com.capnong.repository.UserRepository;
import com.capnong.security.UserDetailsImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/htx")
public class HtxController {

    private final HtxRepository htxRepository;
    private final HtxJoinRequestRepository joinRequestRepository;
    private final UserRepository userRepository;

    public HtxController(HtxRepository htxRepository,
                          HtxJoinRequestRepository joinRequestRepository,
                          UserRepository userRepository) {
        this.htxRepository = htxRepository;
        this.joinRequestRepository = joinRequestRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<ApiResponse<Htx>> createHtx(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Htx htx) {
        if (htxRepository.existsByOfficialCode(htx.getOfficialCode())) {
            throw new AppException("Mã HTX đã tồn tại", HttpStatus.CONFLICT);
        }
        htx.setManagerId(userDetails.getId());
        htx.setStatus(HtxStatus.PENDING);
        Htx saved = htxRepository.save(htx);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đã gửi yêu cầu tạo HTX", saved));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Htx>> getHtx(@PathVariable UUID id) {
        Htx htx = htxRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy HTX", HttpStatus.NOT_FOUND));
        return ResponseEntity.ok(ApiResponse.success("OK", htx));
    }

    @GetMapping("/{id}/members")
    @PreAuthorize("hasRole('HTX_MANAGER')")
    public ResponseEntity<ApiResponse<List<User>>> getMembers(@PathVariable UUID id) {
        List<User> members = userRepository.findByHtxId(id);
        return ResponseEntity.ok(ApiResponse.success("OK", members));
    }

    @PostMapping("/{id}/join")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<ApiResponse<HtxJoinRequest>> requestJoin(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody(required = false) Map<String, String> body) {
        if (joinRequestRepository.existsByHtxIdAndFarmerIdAndStatus(id, userDetails.getId(), JoinRequestStatus.PENDING)) {
            throw new AppException("Bạn đã gửi yêu cầu gia nhập rồi", HttpStatus.CONFLICT);
        }
        HtxJoinRequest request = HtxJoinRequest.builder()
                .htxId(id)
                .farmerId(userDetails.getId())
                .message(body != null ? body.get("message") : null)
                .build();
        joinRequestRepository.save(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đã gửi yêu cầu gia nhập HTX", request));
    }

    @GetMapping("/join-requests")
    @PreAuthorize("hasRole('HTX_MANAGER')")
    public ResponseEntity<ApiResponse<List<HtxJoinRequest>>> getPendingRequests(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId()).get();
        List<HtxJoinRequest> requests = joinRequestRepository
                .findByHtxIdAndStatus(user.getHtxId(), JoinRequestStatus.PENDING);
        return ResponseEntity.ok(ApiResponse.success("OK", requests));
    }

    @PatchMapping("/join-requests/{requestId}")
    @PreAuthorize("hasRole('HTX_MANAGER')")
    public ResponseEntity<ApiResponse<HtxJoinRequest>> handleJoinRequest(
            @PathVariable UUID requestId,
            @RequestBody Map<String, String> body) {
        HtxJoinRequest request = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new AppException("Không tìm thấy yêu cầu", HttpStatus.NOT_FOUND));

        JoinRequestStatus status = JoinRequestStatus.valueOf(body.get("status"));
        request.setStatus(status);
        request.setNote(body.get("note"));
        joinRequestRepository.save(request);

        // Nếu approve → upgrade role farmer thành HTX_MEMBER
        if (status == JoinRequestStatus.APPROVED) {
            User farmer = userRepository.findById(request.getFarmerId()).get();
            farmer.setRole(Role.HTX_MEMBER);
            farmer.setHtxId(request.getHtxId());
            userRepository.save(farmer);
        }

        return ResponseEntity.ok(ApiResponse.success("Đã xử lý yêu cầu", request));
    }
}
