package com.capnong.security;

import com.capnong.model.User;
import com.capnong.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Load user by username OR phone number (Spring Security gọi method này).
     * Identifier có thể là username hoặc SĐT.
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        User user = userRepository.findByUsernameOrPhone(identifier, identifier)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Không tìm thấy tài khoản với username/SĐT: " + identifier));

        if (!user.getActive()) {
            throw new UsernameNotFoundException("Tài khoản đã bị khóa (banned)");
        }

        return UserDetailsImpl.build(user);
    }
}
