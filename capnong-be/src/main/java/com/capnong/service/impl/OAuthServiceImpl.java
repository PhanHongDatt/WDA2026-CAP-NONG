package com.capnong.service.impl;

import com.capnong.dto.response.AuthResponse;
import com.capnong.dto.response.OAuthCheckResponse;
import com.capnong.exception.AppException;
import com.capnong.model.User;
import com.capnong.model.enums.Role;
import com.capnong.repository.UserRepository;
import com.capnong.security.JwtUtils;
import com.capnong.security.UserDetailsImpl;
import com.capnong.service.OAuthService;
import com.capnong.service.RefreshTokenService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.SecretKey;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OAuthServiceImpl implements OAuthService {

    private static final Logger logger = LoggerFactory.getLogger(OAuthServiceImpl.class);

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;

    @Value("${app.supabase.jwt-secret}")
    private String supabaseJwtSecret;

    @Override
    @Transactional
    public OAuthCheckResponse checkGoogleLogin(String supabaseToken) {
        Map<String, String> googleInfo = parseSupabaseToken(supabaseToken);
        String googleId = googleInfo.get("sub");
        String email = googleInfo.get("email");
        String fullName = googleInfo.get("fullName");
        String avatarUrl = googleInfo.get("avatarUrl");

        Optional<User> byGoogleId = userRepository.findByGoogleId(googleId);
        if (byGoogleId.isPresent()) {
            AuthResponse authResponse = generateAuthResponse(byGoogleId.get());
            return OAuthCheckResponse.builder()
                    .status("LOGIN_SUCCESS")
                    .authResponse(authResponse)
                    .email(email)
                    .fullName(fullName)
                    .avatarUrl(avatarUrl)
                    .build();
        }

        Optional<User> byEmail = userRepository.findByEmail(email);
        if (byEmail.isPresent()) {
            return OAuthCheckResponse.builder()
                    .status("EMAIL_CONFLICT")
                    .email(email)
                    .fullName(fullName)
                    .avatarUrl(avatarUrl)
                    .build();
        }

        return OAuthCheckResponse.builder()
                .status("NEEDS_REGISTRATION")
                .email(email)
                .fullName(fullName)
                .avatarUrl(avatarUrl)
                .build();
    }

    @Override
    @Transactional
    public AuthResponse registerWithGoogle(String supabaseToken, String username) {
        Map<String, String> googleInfo = parseSupabaseToken(supabaseToken);
        String googleId = googleInfo.get("sub");
        String email = googleInfo.get("email");
        String fullName = googleInfo.get("fullName");
        String avatarUrl = googleInfo.get("avatarUrl");

        if (userRepository.findByGoogleId(googleId).isPresent()) {
            throw new AppException("Tài khoản Google này đã được liên kết", HttpStatus.CONFLICT);
        }

        if (userRepository.existsByEmail(email)) {
            throw new AppException("Email đã được sử dụng. Vui lòng đăng nhập và liên kết tài khoản Google.", HttpStatus.CONFLICT);
        }

        if (userRepository.existsByUsername(username)) {
            throw new AppException("Username đã được sử dụng, vui lòng chọn tên khác", HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .username(username)
                .email(email)
                .fullName(fullName.isEmpty() ? null : fullName)
                .avatarUrl(avatarUrl.isEmpty() ? null : avatarUrl)
                .googleId(googleId)
                .password(null)
                .role(Role.BUYER)
                .build();

        userRepository.save(user);
        logger.info("Đăng ký thành công tài khoản Google cho user: {}", username);

        return generateAuthResponse(user);
    }

    @Override
    @Transactional
    public void linkGoogleAccount(UUID userId, String supabaseToken) {
        Map<String, String> googleInfo = parseSupabaseToken(supabaseToken);
        String googleId = googleInfo.get("sub");
        String googleEmail = googleInfo.get("email");

        Optional<User> existingGoogle = userRepository.findByGoogleId(googleId);
        if (existingGoogle.isPresent()) {
            throw new AppException("Tài khoản Google này đã được liên kết với một tài khoản khác", HttpStatus.CONFLICT);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("Không tìm thấy user", HttpStatus.NOT_FOUND));

        user.setGoogleId(googleId);

        if (user.getEmail() == null) {
            if (userRepository.existsByEmail(googleEmail)) {
                throw new AppException("Email Google đã được sử dụng bởi tài khoản khác", HttpStatus.CONFLICT);
            }
            user.setEmail(googleEmail);
        }

        userRepository.save(user);
        logger.info("Liên kết Google thành công cho userId: {}", userId);
    }

    // ─── Helpers ────────────────────────────────────────

    private Map<String, String> parseSupabaseToken(String supabaseToken) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(supabaseJwtSecret));
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(supabaseToken)
                    .getPayload();

            String sub = claims.getSubject();

            @SuppressWarnings("unchecked")
            Map<String, Object> userMetadata = (Map<String, Object>) claims.get("user_metadata");

            String email = userMetadata != null ? (String) userMetadata.get("email") : claims.get("email", String.class);
            String fullName = userMetadata != null ? (String) userMetadata.get("full_name") : null;
            String avatarUrl = userMetadata != null ? (String) userMetadata.get("avatar_url") : null;

            if (email == null) {
                throw new AppException("Token không chứa thông tin email", HttpStatus.BAD_REQUEST);
            }

            return Map.of(
                    "sub", sub,
                    "email", email != null ? email : "",
                    "fullName", fullName != null ? fullName : "",
                    "avatarUrl", avatarUrl != null ? avatarUrl : ""
            );
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Lỗi khi giải mã Supabase token: {}", e.getMessage());
            throw new AppException("Supabase token không hợp lệ hoặc đã hết hạn", HttpStatus.UNAUTHORIZED);
        }
    }

    private AuthResponse generateAuthResponse(User user) {
        UserDetailsImpl userDetails = new UserDetailsImpl(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );

        String accessToken = jwtUtils.generateToken(userDetails);
        var refreshToken = refreshTokenService.createRefreshToken(user);

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
}
