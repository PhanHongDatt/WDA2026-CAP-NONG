package com.capnong.service;

import com.capnong.model.RefreshToken;
import com.capnong.model.User;

public interface RefreshTokenService {
    RefreshToken createRefreshToken(User user);
    RefreshToken verifyRefreshToken(String token);
    void revokeAllUserTokens(User user);
}
