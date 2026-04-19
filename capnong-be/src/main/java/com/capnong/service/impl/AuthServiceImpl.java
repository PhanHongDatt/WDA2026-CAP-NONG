package com.capnong.service.impl;

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
import com.capnong.service.AuthService;
import com.capnong.service.OrderService;
import com.capnong.service.OtpService;
import com.capnong.service.RefreshTokenService;
import com.capnong.service.ShopService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final OrderService orderService;
    private final RefreshTokenService refreshTokenService;
    private final OtpService otpService;
    private final ShopService shopService;

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findFirstByUsernameOrPhoneOrEmail(request.getIdentifier(), request.getIdentifier(), request.getIdentifier())
                .orElseThrow(() -> new AppException("Tài khoản không tồn tại", HttpStatus.NOT_FOUND));

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getUsername(), request.getPassword()));

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        String shopSlug = shopService.getShopSlugByUsername(user.getUsername());
        String accessToken = jwtUtils.generateToken(userDetails, shopSlug);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .expiresIn(jwtUtils.getExpirationMs())
                .username(user.getUsername())
                .phone(user.getPhone())
                .email(user.getEmail())
                .role(user.getRole().name())
                .shopSlug(shopSlug)
                .build();
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String identifier = request.getIdentifier();

        otpService.verifyOtp(identifier, request.getOtp());

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

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException("Tên tài khoản (username) đã được sử dụng", HttpStatus.CONFLICT);
        }

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

        if (phone != null) {
            orderService.mergeGuestOrdersToUser(phone, null, user.getId());
        }
        if (email != null) {
            orderService.mergeGuestOrdersToUser(null, email, user.getId());
        }

        return login(new LoginRequest(request.getUsername(), request.getPassword()));
    }

    @Override
    @Transactional
    public AuthResponse refreshAccessToken(String refreshTokenStr) {
        RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(refreshTokenStr);
        User user = refreshToken.getUser();

        UserDetailsImpl userDetails = UserDetailsImpl.build(user);

        String shopSlug = shopService.getShopSlugByUsername(user.getUsername());
        String newAccessToken = jwtUtils.generateToken(userDetails, shopSlug);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken.getToken())
                .expiresIn(jwtUtils.getExpirationMs())
                .username(user.getUsername())
                .phone(user.getPhone())
                .email(user.getEmail())
                .role(user.getRole().name())
                .shopSlug(shopSlug)
                .build();
    }

    @Override
    @Transactional
    public void logout(String refreshTokenStr) {
        RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(refreshTokenStr);
        refreshTokenService.revokeAllUserTokens(refreshToken.getUser());
    }

    @Override
    @Transactional
    public void forgotPassword(String identifier) {
        if (!userRepository.existsByPhone(identifier) &&
            !userRepository.existsByEmail(identifier)) {
            throw new AppException("Không tìm thấy tài khoản với SĐT/Email này", HttpStatus.NOT_FOUND);
        }
        otpService.sendOtp(identifier);
    }

    @Override
    @Transactional
    public void resetPassword(String identifier, String otp, String newPassword) {
        User user = userRepository.findFirstByUsernameOrPhoneOrEmail(identifier, identifier, identifier)
                .orElseThrow(() -> new AppException("Không tìm thấy tài khoản", HttpStatus.NOT_FOUND));

        otpService.verifyOtp(identifier, otp);
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        refreshTokenService.revokeAllUserTokens(user);
    }

    @Override
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
