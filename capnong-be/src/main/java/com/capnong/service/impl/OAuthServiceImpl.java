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
import com.capnong.service.ShopService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
    private final ShopService shopService;

    @Value("${app.supabase.url}")
    private String supabaseUrl;

    @Value("${app.supabase.anon-key}")
    private String supabaseAnonKey;

    @Override
    @Transactional
    public OAuthCheckResponse checkGoogleLogin(String supabaseToken) {
        Map<String, String> googleInfo = parseSupabaseToken(supabaseToken);
        String googleId = googleInfo.get("sub");
        String email = googleInfo.get("email");
        String fullName = googleInfo.get("fullName");
        String avatarUrl = googleInfo.get("avatarUrl");

        // 1. Tìm theo google_id chính xác
        Optional<User> byGoogleId = userRepository.findByGoogleId(googleId);
        if (byGoogleId.isPresent()) {
            User user = byGoogleId.get();
            // Cập nhật google_email nếu chưa có
            if (user.getGoogleEmail() == null && !email.isEmpty()) {
                user.setGoogleEmail(email);
                userRepository.save(user);
            }
            AuthResponse authResponse = generateAuthResponse(user);
            return OAuthCheckResponse.builder()
                    .status("LOGIN_SUCCESS")
                    .authResponse(authResponse)
                    .email(email)
                    .fullName(fullName)
                    .avatarUrl(avatarUrl)
                    .build();
        }

        // 2. Auto-recovery: tìm user theo email có google_id cũ (bị lưu sai UUID Supabase)
        //    → tự động cập nhật sang google sub đúng
        Optional<User> byEmail = userRepository.findByEmail(email);
        if (byEmail.isPresent()) {
            User existingUser = byEmail.get();
            if (existingUser.getGoogleId() != null) {
                // User đã từng link Google nhưng google_id bị sai → auto-fix
                logger.info("Auto-recovery: Cập nhật google_id cho user {} từ {} sang {}",
                        existingUser.getUsername(), existingUser.getGoogleId(), googleId);
                existingUser.setGoogleId(googleId);
                existingUser.setGoogleEmail(email);
                userRepository.save(existingUser);
                AuthResponse authResponse = generateAuthResponse(existingUser);
                return OAuthCheckResponse.builder()
                        .status("LOGIN_SUCCESS")
                        .authResponse(authResponse)
                        .email(email)
                        .fullName(fullName)
                        .avatarUrl(avatarUrl)
                        .build();
            }
            // Email tồn tại nhưng chưa link Google → yêu cầu đăng nhập bằng mật khẩu rồi link
            return OAuthCheckResponse.builder()
                    .status("EMAIL_CONFLICT")
                    .email(email)
                    .fullName(fullName)
                    .avatarUrl(avatarUrl)
                    .build();
        }

        // 3. Hoàn toàn mới → yêu cầu đăng ký
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
            throw new AppException("Email đã được sử dụng. Vui lòng đăng nhập và liên kết tài khoản Google.",
                    HttpStatus.CONFLICT);
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
        user.setGoogleEmail(googleEmail);

        userRepository.save(user);
        logger.info("Liên kết Google thành công cho userId: {}", userId);
    }

    @Override
    @Transactional
    public void unlinkGoogleAccount(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("Không tìm thấy user", HttpStatus.NOT_FOUND));

        if (user.getGoogleId() == null) {
            throw new AppException("Tài khoản chưa liên kết Google", HttpStatus.BAD_REQUEST);
        }

        // Đảm bảo user có password trước khi unlink (tránh lock-out)
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new AppException("Không thể hủy liên kết Google vì tài khoản chưa đặt mật khẩu", HttpStatus.BAD_REQUEST);
        }

        user.setGoogleId(null);
        user.setGoogleEmail(null);
        userRepository.save(user);
        logger.info("Hủy liên kết Google thành công cho userId: {}", userId);
    }

    // ─── Helpers ────────────────────────────────────────

    private Map<String, String> parseSupabaseToken(String supabaseToken) {
        try {
            // Verify token via Supabase REST API — no JWT secret needed
            java.net.http.HttpClient httpClient = java.net.http.HttpClient.newHttpClient();
            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(supabaseUrl + "/auth/v1/user"))
                    .header("Authorization", "Bearer " + supabaseToken)
                    .header("apikey", supabaseAnonKey)
                    .GET()
                    .build();

            java.net.http.HttpResponse<String> response = httpClient.send(request,
                    java.net.http.HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                logger.error("Supabase API trả về status: {} body: {}", response.statusCode(), response.body());
                throw new AppException("Supabase token không hợp lệ hoặc đã hết hạn", HttpStatus.UNAUTHORIZED);
            }

            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode user = mapper.readTree(response.body());

            // ── Extract Google sub từ identities[] (KHÔNG dùng top-level id — đó là Supabase UUID) ──
            String sub = "";
            if (user.has("identities") && user.get("identities").isArray()) {
                for (com.fasterxml.jackson.databind.JsonNode identity : user.get("identities")) {
                    String provider = identity.has("provider") ? identity.get("provider").asText() : "";
                    if ("google".equals(provider)) {
                        // Ưu tiên identity_data.sub, fallback sang identity.id
                        if (identity.has("identity_data") && identity.get("identity_data").has("sub")) {
                            sub = identity.get("identity_data").get("sub").asText("");
                        }
                        if (sub.isEmpty() && identity.has("id")) {
                            sub = identity.get("id").asText("");
                        }
                        break;
                    }
                }
            }
            // Fallback cuối cùng: dùng top-level id (trường hợp edge case không có identities)
            if (sub.isEmpty()) {
                sub = user.has("id") ? user.get("id").asText() : "";
                logger.warn("Không tìm thấy Google identity trong identities[], fallback dùng Supabase id: {}", sub);
            }

            String email = "";
            String fullName = "";
            String avatarUrl = "";

            // Extract from user_metadata
            if (user.has("user_metadata") && !user.get("user_metadata").isNull()) {
                com.fasterxml.jackson.databind.JsonNode meta = user.get("user_metadata");
                email = meta.has("email") ? meta.get("email").asText("") : "";
                fullName = meta.has("full_name") ? meta.get("full_name").asText("") : "";
                avatarUrl = meta.has("avatar_url") ? meta.get("avatar_url").asText("") : "";
            }

            // Fallback email from top-level
            if (email.isEmpty() && user.has("email")) {
                email = user.get("email").asText("");
            }

            if (email.isEmpty()) {
                throw new AppException("Token không chứa thông tin email", HttpStatus.BAD_REQUEST);
            }

            logger.debug("Parsed Supabase token: googleSub={}, email={}", sub, email);

            return Map.of(
                    "sub", sub,
                    "email", email,
                    "fullName", fullName,
                    "avatarUrl", avatarUrl);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Lỗi khi xác thực Supabase token: {}", e.getMessage());
            throw new AppException("Supabase token không hợp lệ hoặc đã hết hạn", HttpStatus.UNAUTHORIZED);
        }
    }

    private AuthResponse generateAuthResponse(User user) {
        UserDetailsImpl userDetails = new UserDetailsImpl(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));

        String shopSlug = shopService.getShopSlugByUsername(user.getUsername());
        String accessToken = jwtUtils.generateToken(userDetails, shopSlug);
        var refreshToken = refreshTokenService.createRefreshToken(user);

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
}
