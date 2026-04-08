package com.capnong.service;

import com.capnong.dto.request.UpdateProfileRequest;
import com.capnong.dto.response.UserResponse;
import com.capnong.exception.AppException;
import com.capnong.model.User;
import com.capnong.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    /**
     * Lấy thông tin profile của user hiện tại.
     */
    @Transactional(readOnly = true)
    public UserResponse getProfile(Long userId) {
        User user = findUserById(userId);
        return mapToUserResponse(user);
    }

    /**
     * Cập nhật thông tin profile (fullName, email).
     */
    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = findUserById(userId);

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new AppException("Email đã được sử dụng bởi tài khoản khác", HttpStatus.CONFLICT);
            }
            user.setEmail(request.getEmail());
        }

        userRepository.save(user);
        return mapToUserResponse(user);
    }

    /**
     * Upload avatar lên Cloudinary và lưu URL vào user.
     */
    @Transactional
    public UserResponse uploadAvatar(Long userId, MultipartFile file) {
        User user = findUserById(userId);

        // Validate file
        if (file.isEmpty()) {
            throw new AppException("File ảnh không được để trống", HttpStatus.BAD_REQUEST);
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new AppException("Chỉ chấp nhận file ảnh (image/*)", HttpStatus.BAD_REQUEST);
        }

        // Upload lên Cloudinary
        String avatarUrl = cloudinaryService.uploadImage(file, "capnong/avatars");
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);

        return mapToUserResponse(user);
    }

    // ─── Helpers ─────────────────────────────────

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new AppException("Không tìm thấy user", HttpStatus.NOT_FOUND));
    }

    public UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .phone(user.getPhone())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole().name())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
