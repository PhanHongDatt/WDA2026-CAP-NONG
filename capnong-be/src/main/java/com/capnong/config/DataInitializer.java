package com.capnong.config;

import com.capnong.model.User;
import com.capnong.model.enums.Role;
import com.capnong.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Tạo dữ liệu mẫu khi khởi động ứng dụng (chỉ chạy ở profile "dev").
 * Mỗi role sẽ có 1 tài khoản test sẵn.
 * 
 * Mật khẩu mặc định: Password123!
 */
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private static final String DEFAULT_PASSWORD = "Password123!";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("========================================");
        log.info("🌱 Kiểm tra dữ liệu test...");

        String encodedPassword = passwordEncoder.encode(DEFAULT_PASSWORD);

        createUserIfNotExists("admin", "admin@capnong.vn", "0900000001", "Quản Trị Viên", Role.ADMIN, encodedPassword);
        createUserIfNotExists("buyer", "buyer@capnong.vn", "0900000002", "Người Mua Test", Role.BUYER, encodedPassword);
        createUserIfNotExists("farmer", "farmer@capnong.vn", "0900000003", "Nông Dân Test", Role.FARMER, encodedPassword);
        createUserIfNotExists("htx_member", "htxmember@capnong.vn", "0900000004", "Thành Viên HTX Test", Role.HTX_MEMBER, encodedPassword);
        createUserIfNotExists("htx_manager", "htxmanager@capnong.vn", "0900000005", "Quản Lý HTX Test", Role.HTX_MANAGER, encodedPassword);

        log.info("✅ Dữ liệu test đã sẵn sàng!");
        log.info("   Mật khẩu chung: {}", DEFAULT_PASSWORD);
        log.info("========================================");
    }

    private void createUserIfNotExists(String username, String email, String phone,
                                        String fullName, Role role, String encodedPassword) {
        if (userRepository.existsByUsername(username)) {
            log.info("   ⏩ {} ({}) — đã tồn tại, bỏ qua.", username, role);
            return;
        }

        User user = User.builder()
                .username(username)
                .email(email)
                .phone(phone)
                .fullName(fullName)
                .password(encodedPassword)
                .role(role)
                .active(true)
                .build();

        userRepository.save(user);
        log.info("   ✅ Tạo tài khoản: {} | {} | {} | {}", username, email, phone, role);
    }
}
