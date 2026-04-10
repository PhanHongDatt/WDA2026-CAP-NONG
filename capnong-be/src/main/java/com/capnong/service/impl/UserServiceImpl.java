package com.capnong.service.impl;

import com.capnong.dto.request.UpdateProfileRequest;
import com.capnong.dto.response.UserResponse;
import com.capnong.exception.AppException;
import com.capnong.mapper.UserMapper;
import com.capnong.model.User;
import com.capnong.repository.UserRepository;
import com.capnong.service.CloudinaryService;
import com.capnong.service.OtpService;
import com.capnong.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final OtpService otpService;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getProfile(UUID userId) {
        User user = findUserById(userId);
        return userMapper.toUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = findUserById(userId);

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }

        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            if (user.getUsernameUpdatedAt() != null) {
                long daysSinceLastChange = ChronoUnit.DAYS.between(
                        user.getUsernameUpdatedAt(), LocalDateTime.now());
                if (daysSinceLastChange < 30) {
                    throw new AppException(
                            "Bạn chỉ có thể đổi username mỗi 30 ngày. Còn " + (30 - daysSinceLastChange) + " ngày nữa.",
                            HttpStatus.TOO_MANY_REQUESTS);
                }
            }
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new AppException("Username đã được dùng bởi người khác", HttpStatus.CONFLICT);
            }
            user.setUsername(request.getUsername());
            user.setUsernameUpdatedAt(LocalDateTime.now());
        }

        boolean shouldVerifyOtp = false;
        String otpIdentifier = null;

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new AppException("Email đã được sử dụng bởi tài khoản khác", HttpStatus.CONFLICT);
            }
            user.setEmail(request.getEmail());
            shouldVerifyOtp = true;
            otpIdentifier = request.getEmail();
        }

        if (request.getPhone() != null && !request.getPhone().equals(user.getPhone())) {
            if (userRepository.existsByPhone(request.getPhone())) {
                throw new AppException("Số điện thoại đã được sử dụng bởi tài khoản khác", HttpStatus.CONFLICT);
            }
            user.setPhone(request.getPhone());
            shouldVerifyOtp = true;
            otpIdentifier = request.getPhone();
        }

        if (shouldVerifyOtp) {
            otpService.verifyOtp(otpIdentifier, request.getOtp());
        }

        userRepository.save(user);
        return userMapper.toUserResponse(user);
    }

    @Override
    public void sendUpdateOtp(String identifier) {
        if (identifier.contains("@") && userRepository.existsByEmail(identifier)) {
            throw new AppException("Email này đã được sử dụng", HttpStatus.CONFLICT);
        }
        if (!identifier.contains("@") && userRepository.existsByPhone(identifier)) {
            throw new AppException("Số điện thoại này đã được sử dụng", HttpStatus.CONFLICT);
        }
        otpService.sendOtp(identifier);
    }

    @Override
    @Transactional
    public UserResponse uploadAvatar(UUID userId, MultipartFile file) {
        User user = findUserById(userId);

        if (file.isEmpty()) {
            throw new AppException("File ảnh không được để trống", HttpStatus.BAD_REQUEST);
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new AppException("Chỉ chấp nhận file ảnh (image/*)", HttpStatus.BAD_REQUEST);
        }

        String avatarUrl = cloudinaryService.uploadImage(file, "capnong/avatars");
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);

        return userMapper.toUserResponse(user);
    }

    @Override
    @Transactional
    public void changePassword(UUID userId, String oldPassword, String newPassword) {
        User user = findUserById(userId);

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new AppException("Mật khẩu cũ không chính xác", HttpStatus.BAD_REQUEST);
        }

        if (oldPassword.equals(newPassword)) {
            throw new AppException("Mật khẩu mới không được trùng với mật khẩu cũ", HttpStatus.BAD_REQUEST);
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // ─── Helpers ─────────────────────────────────

    private User findUserById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new AppException("Không tìm thấy user", HttpStatus.NOT_FOUND));
    }
}
