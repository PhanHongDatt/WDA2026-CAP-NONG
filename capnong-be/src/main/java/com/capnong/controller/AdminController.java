package com.capnong.controller;

import com.capnong.dto.response.ApiResponse;
import com.capnong.exception.AppException;
import com.capnong.model.Htx;
import com.capnong.model.User;
import com.capnong.model.enums.HtxStatus;
import com.capnong.model.enums.Role;
import com.capnong.repository.HtxRepository;
import com.capnong.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final HtxRepository htxRepository;
    private final UserRepository userRepository;

    public AdminController(HtxRepository htxRepository, UserRepository userRepository) {
        this.htxRepository = htxRepository;
        this.userRepository = userRepository;
    }

    // ─── HTX Management ──────────────────────────
    @GetMapping("/htx-requests")
    public ResponseEntity<ApiResponse<List<Htx>>> getPendingHtx() {
        List<Htx> pending = htxRepository.findByStatus(HtxStatus.PENDING);
        return ResponseEntity.ok(ApiResponse.success("OK", pending));
    }

    @PatchMapping("/htx/{id}/approve")
    public ResponseEntity<ApiResponse<Htx>> approveHtx(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        Htx htx = htxRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy HTX", HttpStatus.NOT_FOUND));

        String action = body.get("action"); // APPROVE or REJECT
        htx.setAdminNote(body.get("note"));

        if ("APPROVE".equals(action)) {
            htx.setStatus(HtxStatus.ACTIVE);
            htxRepository.save(htx);
            // Upgrade creator → HTX_MANAGER
            User manager = userRepository.findById(htx.getManagerId()).get();
            manager.setRole(Role.HTX_MANAGER);
            manager.setHtxId(htx.getId());
            userRepository.save(manager);
        } else {
            htx.setStatus(HtxStatus.REJECTED);
            htxRepository.save(htx);
        }

        return ResponseEntity.ok(ApiResponse.success("Đã xử lý HTX", htx));
    }

    // ─── User Management ─────────────────────────
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<User>>> getUsers(
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<User> users;
        if (keyword != null && !keyword.isBlank()) {
            users = userRepository.searchUsers(keyword, pageable);
        } else {
            users = userRepository.findAll(pageable);
        }
        return ResponseEntity.ok(ApiResponse.success("OK", users));
    }

    @PatchMapping("/users/{id}/ban")
    public ResponseEntity<ApiResponse<User>> toggleBan(
            @PathVariable UUID id,
            @RequestBody Map<String, Boolean> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy user", HttpStatus.NOT_FOUND));
        user.setIsBanned(body.getOrDefault("banned", true));
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(
                user.getIsBanned() ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản", user));
    }
}
