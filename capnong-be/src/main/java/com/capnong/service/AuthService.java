package com.capnong.service;

import com.capnong.dto.request.LoginRequest;
import com.capnong.dto.request.RegisterRequest;
import com.capnong.dto.response.AuthResponse;
import com.capnong.exception.AppException;
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

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    /**
     * Authenticate user and return JWT token.
     */
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(), request.getPassword()));

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String token = jwtUtils.generateToken(userDetails);

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    /**
     * Register a new user.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException("Username is already taken", HttpStatus.CONFLICT);
        }

        // Ánh xạ role từ request, mặc định là BUYER. Khóa chỉ cho phép chọn BUYER/FARMER.
        Role assignedRole = Role.BUYER;
        if (request.getRole() != null && request.getRole().equalsIgnoreCase("FARMER")) {
            assignedRole = Role.FARMER;
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(assignedRole)
                .build();

        userRepository.save(user);

        return login(new LoginRequest(request.getUsername(), request.getPassword()));
    }
}
