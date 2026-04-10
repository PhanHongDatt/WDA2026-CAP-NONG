package com.capnong.service;

import com.capnong.dto.request.UpdateProfileRequest;
import com.capnong.dto.response.UserResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface UserService {

    UserResponse getProfile(UUID userId);

    UserResponse updateProfile(UUID userId, UpdateProfileRequest request);

    void sendUpdateOtp(String identifier);

    UserResponse uploadAvatar(UUID userId, MultipartFile file);

    void changePassword(UUID userId, String oldPassword, String newPassword);
}
