package com.capnong.service;

import com.capnong.exception.AppException;
import com.capnong.model.Htx;
import com.capnong.model.Shop;
import com.capnong.model.User;
import com.capnong.model.enums.HtxStatus;
import com.capnong.model.enums.NotificationType;
import com.capnong.repository.HtxRepository;
import com.capnong.repository.ShopRepository;
import com.capnong.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AdminService {

    private final HtxRepository htxRepository;
    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final NotificationService notificationService;

    public AdminService(HtxRepository htxRepository,
                        UserRepository userRepository,
                        ShopRepository shopRepository,
                        NotificationService notificationService) {
        this.htxRepository = htxRepository;
        this.userRepository = userRepository;
        this.shopRepository = shopRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public Htx approveHtx(UUID htxId) {
        Htx htx = htxRepository.findById(htxId)
                .orElseThrow(() -> new AppException("Không tìm thấy HTX", HttpStatus.NOT_FOUND));

        if (htx.getStatus() != HtxStatus.PENDING) {
            throw new AppException("HTX không ở trạng thái chờ duyệt", HttpStatus.BAD_REQUEST);
        }

        htx.setStatus(HtxStatus.ACTIVE);
        htxRepository.save(htx);

        // Auto-create HTX Shop with slug htx-{official_code}
        String htxSlug = "htx-" + htx.getOfficialCode();
        if (!shopRepository.existsBySlug(htxSlug)) {
            Shop htxShop = Shop.builder()
                    .ownerId(htx.getManagerId())
                    .slug(htxSlug)
                    .name(htx.getName())
                    .province(htx.getProvince())
                    .district(htx.getDistrict())
                    .bio("Gian hàng chính thức của " + htx.getName())
                    .build();
            shopRepository.save(htxShop);
        }

        // Notify manager
        notificationService.createNotification(htx.getManagerId(),
                NotificationType.HTX_APPROVED,
                "HTX đã được phê duyệt",
                "HTX " + htx.getName() + " đã được admin phê duyệt. Gian hàng HTX đã sẵn sàng.");

        return htx;
    }

    @Transactional
    public Htx rejectHtx(UUID htxId, String reason) {
        Htx htx = htxRepository.findById(htxId)
                .orElseThrow(() -> new AppException("Không tìm thấy HTX", HttpStatus.NOT_FOUND));

        htx.setStatus(HtxStatus.REJECTED);
        htxRepository.save(htx);

        notificationService.createNotification(htx.getManagerId(),
                NotificationType.HTX_REJECTED,
                "HTX bị từ chối",
                "HTX " + htx.getName() + " đã bị từ chối. Lý do: " + reason);

        return htx;
    }

    @Transactional
    public User banUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("Không tìm thấy user", HttpStatus.NOT_FOUND));
        user.setIsBanned(true);
        return userRepository.save(user);
    }

    @Transactional
    public User unbanUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("Không tìm thấy user", HttpStatus.NOT_FOUND));
        user.setIsBanned(false);
        return userRepository.save(user);
    }

    public Page<User> listUsers(String keyword, Pageable pageable) {
        if (keyword != null && !keyword.isBlank()) {
            return userRepository.searchUsers(keyword, pageable);
        }
        return userRepository.findAll(pageable);
    }
}
