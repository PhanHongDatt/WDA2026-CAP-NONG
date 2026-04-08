package com.capnong.service;

import java.util.UUID;

import com.capnong.dto.response.AuthResponse;
import com.capnong.dto.response.OAuthCheckResponse;
import com.capnong.exception.AppException;
import com.capnong.model.User;
import com.capnong.model.enums.Role;
import com.capnong.repository.UserRepository;
import com.capnong.security.JwtUtils;
import com.capnong.security.UserDetailsImpl;
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

@Service
@RequiredArgsConstructor
public class OAuthService {

    private static final Logger logger = LoggerFactory.getLogger(OAuthService.class);

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;

    @Value("${app.supabase.jwt-secret}")
    private String supabaseJwtSecret;

    // ─── Supabase Token Parsing ────────────────────────

    /**
     * Giải mã Supabase JWT Access Token để lấy thông tin Google user.
     * Trả về Map chứa: sub (google user id), email, full_name, avatar_url
     */
    public Map<String, String> parseSupabaseToken(String supabaseToken) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(supabaseJwtSecret));
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(supabaseToken)
                    .getPayload();

            String sub = claims.getSubject(); // Supabase auth user id

            // User metadata from Google
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

    // ─── OAuth Check (Bước 1) ──────────────────────────

    /**
     * Kiểm tra trạng thái OAuth:
     * - LOGIN_SUCCESS: GoogleId đã liên kết -> tự động login.
     * - EMAIL_CONFLICT: Email tồn tại nhưng chưa liên kết Google -> yêu cầu link account.
     * - NEEDS_REGISTRATION: Hoàn toàn mới -> yêu cầu FE hiện form nhập username.
     */
    @Transactional
    public OAuthCheckResponse checkGoogleLogin(String supabaseToken) {
        Map<String, String> googleInfo = parseSupabaseToken(supabaseToken);
        String googleId = googleInfo.get("sub");
        String email = googleInfo.get("email");
        String fullName = googleInfo.get("fullName");
        String avatarUrl = googleInfo.get("avatarUrl");

        // Case 1: GoogleId đã liên kết với một User
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

        // Case 2: Email đã tồn tại (đăng ký bằng mật khẩu) nhưng chưa liên kết Google
        Optional<User> byEmail = userRepository.findByEmail(email);
        if (byEmail.isPresent()) {
            return OAuthCheckResponse.builder()
                    .status("EMAIL_CONFLICT")
                    .email(email)
                    .fullName(fullName)
                    .avatarUrl(avatarUrl)
                    .build();
        }

        // Case 3: Hoàn toàn mới
        return OAuthCheckResponse.builder()
                .status("NEEDS_REGISTRATION")
                .email(email)
                .fullName(fullName)
                .avatarUrl(avatarUrl)
                .build();
    }

    // ─── OAuth Register (Bước 2) ───────────────────────

    /**
     * Hoàn tất đăng ký bằng Google OAuth. User đã chọn username trên FE.
     */
    @Transactional
    public AuthResponse registerWithGoogle(String supabaseToken, String username) {
        Map<String, String> googleInfo = parseSupabaseToken(supabaseToken);
        String googleId = googleInfo.get("sub");
        String email = googleInfo.get("email");
        String fullName = googleInfo.get("fullName");
        String avatarUrl = googleInfo.get("avatarUrl");

        // Double-check: GoogleId đã liên kết chưa?
        if (userRepository.findByGoogleId(googleId).isPresent()) {
            throw new AppException("Tài khoản Google này đã được liên kết", HttpStatus.CONFLICT);
        }

        // Check email conflict
        if (userRepository.existsByEmail(email)) {
            throw new AppException("Email đã được sử dụng. Vui lòng đăng nhập và liên kết tài khoản Google.", HttpStatus.CONFLICT);
        }

        // Check username uniqueness
        if (userRepository.existsByUsername(username)) {
            throw new AppException("Username đã được sử dụng, vui lòng chọn tên khác", HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .username(username)
                .email(email)
                .fullName(fullName.isEmpty() ? null : fullName)
                .avatarUrl(avatarUrl.isEmpty() ? null : avatarUrl)
                .googleId(googleId)
                .password(null) // OAuth user, không có mật khẩu
                .role(Role.BUYER)
                .build();

        userRepository.save(user);
        logger.info("Đăng ký thành công tài khoản Google cho user: {}", username);

        return generateAuthResponse(user);
    }

    // ─── Link Account ──────────────────────────────────

    /**
     * Liên kết Google vào tài khoản đã đăng nhập.
     */
    @Transactional
    public void linkGoogleAccount(UUID userId, String supabaseToken) {
        Map<String, String> googleInfo = parseSupabaseToken(supabaseToken);
        String googleId = googleInfo.get("sub");
        String googleEmail = googleInfo.get("email");

        // Check googleId đã liên kết chưa
        Optional<User> existingGoogle = userRepository.findByGoogleId(googleId);
        if (existingGoogle.isPresent()) {
            throw new AppException("Tài khoản Google này đã được liên kết với một tài khoản khác", HttpStatus.CONFLICT);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("Không tìm thấy user", HttpStatus.NOT_FOUND));

        // Gán googleId
        user.setGoogleId(googleId);

        // Nếu user chưa có email, tự động gán email từ Google
        if (user.getEmail() == null) {
            if (userRepository.existsByEmail(googleEmail)) {
                throw new AppException("Email Google đã được sử dụng bởi tài khoản khác", HttpStatus.CONFLICT);
            }
            user.setEmail(googleEmail);
        }

        userRepository.save(user);
        logger.info("Liên kết Google thành công cho userId: {}", userId);
    }

    // ─── Helper ────────────────────────────────────────

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
