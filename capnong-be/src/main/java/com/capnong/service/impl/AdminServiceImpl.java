package com.capnong.service.impl;

import com.capnong.dto.request.ChangeRoleRequest;
import com.capnong.dto.response.UserResponse;
import com.capnong.exception.AppException;
import com.capnong.mapper.UserMapper;
import com.capnong.model.User;
import com.capnong.model.enums.Role;
import com.capnong.repository.UserRepository;
import com.capnong.service.AdminService;
import com.capnong.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final RefreshTokenService refreshTokenService;

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(userMapper::toUserResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserDetails(UUID id) {
        return userMapper.toUserResponse(findUserById(id));
    }

    @Override
    @Transactional
    public UserResponse banUser(UUID id) {
        User user = findUserById(id);
        if (user.getRole() == Role.ADMIN) {
            throw new AppException("Cannot ban an ADMIN account", HttpStatus.FORBIDDEN);
        }
        user.setActive(false);
        userRepository.save(user);
        refreshTokenService.revokeAllUserTokens(user);
        return userMapper.toUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse unbanUser(UUID id) {
        User user = findUserById(id);
        user.setActive(true);
        userRepository.save(user);
        return userMapper.toUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse changeUserRole(UUID id, ChangeRoleRequest request) {
        User user = findUserById(id);
        try {
            Role newRole = Role.valueOf(request.getRole().toUpperCase());
            user.setRole(newRole);
            userRepository.save(user);
            refreshTokenService.revokeAllUserTokens(user);
            return userMapper.toUserResponse(user);
        } catch (IllegalArgumentException ex) {
            throw new AppException("Invalid role", HttpStatus.BAD_REQUEST);
        }
    }

    private User findUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
    }
}
