package com.capnong.service;

import com.capnong.dto.request.ChangeRoleRequest;
import com.capnong.dto.response.UserResponse;
import com.capnong.exception.AppException;
import com.capnong.model.User;
import com.capnong.model.enums.Role;
import com.capnong.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final RefreshTokenService refreshTokenService;

    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(userService::mapToUserResponse);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserDetails(Long id) {
        User user = findUserById(id);
        return userService.mapToUserResponse(user);
    }

    @Transactional
    public UserResponse banUser(Long id) {
        User user = findUserById(id);
        if (user.getRole() == Role.ADMIN) {
            throw new AppException("Cannot ban an ADMIN account", HttpStatus.FORBIDDEN);
        }
        
        user.setActive(false);
        userRepository.save(user);
        
        // Cực kỳ quan trọng: Thu hồi token lập tức để user bị session timeout
        refreshTokenService.revokeAllUserTokens(user);
        
        return userService.mapToUserResponse(user);
    }

    @Transactional
    public UserResponse unbanUser(Long id) {
        User user = findUserById(id);
        user.setActive(true);
        userRepository.save(user);
        return userService.mapToUserResponse(user);
    }

    @Transactional
    public UserResponse changeUserRole(Long id, ChangeRoleRequest request) {
        User user = findUserById(id);
        
        try {
            Role newRole = Role.valueOf(request.getRole().toUpperCase());
            user.setRole(newRole);
            userRepository.save(user);
            
            // Buộc login lại vì role claim trong JWT cũ không còn chính xác
            refreshTokenService.revokeAllUserTokens(user);
            
            return userService.mapToUserResponse(user);
        } catch (IllegalArgumentException ex) {
            throw new AppException("Invalid role", HttpStatus.BAD_REQUEST);
        }
    }

    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
    }
}
