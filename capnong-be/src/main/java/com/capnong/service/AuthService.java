package com.capnong.service;

import com.capnong.dto.request.LoginRequest;
import com.capnong.dto.request.RegisterRequest;
import com.capnong.dto.response.AuthResponse;
import com.capnong.exception.AppException;
import com.capnong.model.RefreshToken;
import com.capnong.model.User;
import com.capnong.model.enums.Role;
import com.capnong.repository.UserRepository;
import com.capnong.security.JwtUtils;
import com.capnong.security.UserDetailsImpl;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final OrderService orderService;
    private final RefreshTokenService refreshTokenService;

    public AuthService(AuthenticationManager authenticationManager,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtils jwtUtils,
            OrderService orderService,
            RefreshTokenService refreshTokenService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.orderService = orderService;
        this.refreshTokenService = refreshTokenService;
    }

    /**
     * Authenticate user bằng username HOẶC SĐT + password → trả JWT + refresh token.
     */
    public AuthResponse login(LoginRequest request) {
        // Resolve identifier: tìm user bằng username hoặc phone
        User user = userRepository.findByUsernameOrPhone(request.getIdentifier(), request.getIdentifier())
                .orElseThrow(() -> new AppException("Tài khoản không tồn tại", HttpStatus.NOT_FOUND));

        // Authenticate bằng username thực (Spring Security loadUserByUsername)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getUsername(), request.getPassword()));

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String accessToken = jwtUtils.generateToken(userDetails);

        // Tạo refresh token
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .expiresIn(jwtUtils.getExpirationMs())
                .username(user.getUsername())
                .phone(user.getPhone())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    /**
     * Register a new user. Validate uniqueness, lock role to BUYER/FARMER only.
     */
    @SuppressWarnings("null")
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Validate uniqueness
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException("Username đã được sử dụng", HttpStatus.CONFLICT);
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("Email đã được sử dụng", HttpStatus.CONFLICT);
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new AppException("Số điện thoại đã được sử dụng", HttpStatus.CONFLICT);
        }

        // Lock role: chỉ cho phép BUYER hoặc FARMER khi đăng ký
        Role assignedRole = Role.BUYER;
        if (request.getRole() != null && request.getRole().equalsIgnoreCase("FARMER")) {
            assignedRole = Role.FARMER;
        }

        User user = User.builder()
                .username(request.getUsername())
                .phone(request.getPhone())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(assignedRole)
                .build();

        userRepository.save(user);

        // Merge guest orders dùng cả phone và email
        orderService.mergeGuestOrdersToUser(request.getPhone(), request.getEmail(), user.getId());

        // Auto-login sau khi đăng ký
        return login(new LoginRequest(user.getUsername(), request.getPassword()));
    }

    /**
     * Refresh access token bằng refresh token.
     */
    @Transactional
    public AuthResponse refreshAccessToken(String refreshTokenStr) {
        RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(refreshTokenStr);
        User user = refreshToken.getUser();

        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        String newAccessToken = jwtUtils.generateToken(userDetails);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken.getToken())
                .expiresIn(jwtUtils.getExpirationMs())
                .username(user.getUsername())
                .phone(user.getPhone())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    /**
     * Logout: revoke tất cả refresh tokens của user.
     */
    @Transactional
    public void logout(String refreshTokenStr) {
        RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(refreshTokenStr);
        refreshTokenService.revokeAllUserTokens(refreshToken.getUser());
    }
}
