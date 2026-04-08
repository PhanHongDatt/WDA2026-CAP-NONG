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
    private final OtpService otpService;

    public AuthService(AuthenticationManager authenticationManager,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtils jwtUtils,
            OrderService orderService,
            RefreshTokenService refreshTokenService,
            OtpService otpService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.orderService = orderService;
        this.refreshTokenService = refreshTokenService;
        this.otpService = otpService;
    }

    /**
     * Authenticate user bằng username HOẶC SĐT + password → trả JWT + refresh token.
     */
    public AuthResponse login(LoginRequest request) {
        // Resolve identifier: tìm user bằng username, phone hoặc email
        User user = userRepository.findByUsernameOrPhoneOrEmail(request.getIdentifier(), request.getIdentifier(), request.getIdentifier())
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
     * Register a new user. 
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String identifier = request.getIdentifier();
        
        // 1. Validate OTP
        otpService.verifyOtp(identifier, request.getOtp());

        // 2. Identify type and check uniqueness
        String phone = null;
        String email = null;
        
        if (identifier.contains("@")) {
            email = identifier;
            if (userRepository.existsByEmail(email)) {
                throw new AppException("Email đã được sử dụng", HttpStatus.CONFLICT);
            }
        } else {
            phone = identifier;
            if (userRepository.existsByPhone(phone)) {
                throw new AppException("Số điện thoại đã được sử dụng", HttpStatus.CONFLICT);
            }
        }

        // Check explicit username uniqueness
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException("Tên tài khoản (username) đã được sử dụng", HttpStatus.CONFLICT);
        }

        // Lock role: chỉ cho phép BUYER hoặc FARMER khi đăng ký
        Role assignedRole = Role.BUYER;
        if (request.getRole() != null && request.getRole().equalsIgnoreCase("FARMER")) {
            assignedRole = Role.FARMER;
        }

        User user = User.builder()
                .username(request.getUsername())
                .phone(phone)
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(assignedRole)
                .build();

        userRepository.save(user);

        // Merge guest orders
        if (phone != null) {
            orderService.mergeGuestOrdersToUser(phone, null, user.getId());
        }
        if (email != null) {
            orderService.mergeGuestOrdersToUser(null, email, user.getId());
        }

        // Auto-login sau khi đăng ký
        return login(new LoginRequest(request.getUsername(), request.getPassword()));
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

    /**
     * Quên mật khẩu: Gửi OTP đến SĐT hoặc Email
     */
    @Transactional
    public void forgotPassword(String identifier) {
        if (!userRepository.existsByPhone(identifier) && 
            !userRepository.existsByEmail(identifier)) {
            throw new AppException("Không tìm thấy tài khoản với SĐT/Email này", HttpStatus.NOT_FOUND);
        }
        otpService.sendOtp(identifier);
    }

    /**
     * Đặt lại mật khẩu: Xác nhận OTP và lưu mật khẩu mới
     */
    @Transactional
    public void resetPassword(String identifier, String otp, String newPassword) {
        User user = userRepository.findByUsernameOrPhoneOrEmail(identifier, identifier, identifier)
                .orElseThrow(() -> new AppException("Không tìm thấy tài khoản", HttpStatus.NOT_FOUND));

        otpService.verifyOtp(identifier, otp);
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Revoke all existing sessions
        refreshTokenService.revokeAllUserTokens(user);
    }

    /**
     * Gửi OTP để đăng ký tài khoản (qua SĐT/Email)
     */
    @Transactional
    public void sendRegisterOtp(String identifier) {
        if (identifier.contains("@") && userRepository.existsByEmail(identifier)) {
            throw new AppException("Email này đã được sử dụng", HttpStatus.CONFLICT);
        }
        if (!identifier.contains("@") && userRepository.existsByPhone(identifier)) {
            throw new AppException("Số điện thoại này đã được sử dụng", HttpStatus.CONFLICT);
        }
        otpService.sendOtp(identifier);
    }
}
