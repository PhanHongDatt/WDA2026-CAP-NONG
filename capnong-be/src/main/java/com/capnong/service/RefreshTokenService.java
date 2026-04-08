package com.capnong.service;

import com.capnong.exception.AppException;
import com.capnong.model.RefreshToken;
import com.capnong.model.User;
import com.capnong.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    /**
     * Tạo refresh token mới cho user. Revoke tất cả token cũ trước.
     */
    @Transactional
    public RefreshToken createRefreshToken(User user) {
        // Revoke tất cả refresh token cũ của user
        refreshTokenRepository.revokeAllByUser(user);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshExpirationMs))
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    /**
     * Verify refresh token: kiểm tra tồn tại, chưa bị revoke, chưa hết hạn.
     */
    public RefreshToken verifyRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new AppException("Refresh token không hợp lệ", HttpStatus.UNAUTHORIZED));

        if (refreshToken.getRevoked()) {
            throw new AppException("Refresh token đã bị thu hồi", HttpStatus.UNAUTHORIZED);
        }

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            throw new AppException("Refresh token đã hết hạn, vui lòng đăng nhập lại", HttpStatus.UNAUTHORIZED);
        }

        return refreshToken;
    }

    /**
     * Revoke tất cả refresh token của user (dùng cho logout, ban).
     */
    @Transactional
    public void revokeAllUserTokens(User user) {
        refreshTokenRepository.revokeAllByUser(user);
    }
}
