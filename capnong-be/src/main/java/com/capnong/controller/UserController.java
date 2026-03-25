package com.capnong.controller;

import com.capnong.dto.response.ApiResponse;
import com.capnong.model.User;
import com.capnong.exception.AppException;
import com.capnong.repository.UserRepository;
import com.capnong.security.UserDetailsImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        return ResponseEntity.ok(ApiResponse.success("OK", user));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<User>> updateProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, String> updates) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        if (updates.containsKey("fullName")) user.setFullName(updates.get("fullName"));
        if (updates.containsKey("email")) user.setEmail(updates.get("email"));
        if (updates.containsKey("avatarUrl")) user.setAvatarUrl(updates.get("avatarUrl"));

        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công", user));
    }
}
