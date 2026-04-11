package com.capnong.service;

import com.capnong.dto.response.UserResponse;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminService {
    Page<UserResponse> getAllUsers(Pageable pageable);
    UserResponse getUserDetails(UUID id);
    UserResponse banUser(UUID id);
    UserResponse unbanUser(UUID id);
    UserResponse changeUserRole(UUID id, com.capnong.dto.request.ChangeRoleRequest request);
}
