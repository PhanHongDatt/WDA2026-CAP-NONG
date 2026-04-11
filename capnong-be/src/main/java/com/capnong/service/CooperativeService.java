package com.capnong.service;

import com.capnong.exception.AppException;
import com.capnong.model.CooperativeBundle;
import com.capnong.model.BundlePledge;
import com.capnong.model.User;
import com.capnong.model.enums.BundleStatus;
import com.capnong.model.enums.PledgeStatus;
import com.capnong.repository.CooperativeBundleRepository;
import com.capnong.repository.BundlePledgeRepository;
import com.capnong.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
public class CooperativeService {

    private final CooperativeBundleRepository bundleRepository;
    private final BundlePledgeRepository pledgeRepository;
    private final UserRepository userRepository;

    public CooperativeService(CooperativeBundleRepository bundleRepository,
                              BundlePledgeRepository pledgeRepository,
                              UserRepository userRepository) {
        this.bundleRepository = bundleRepository;
        this.pledgeRepository = pledgeRepository;
        this.userRepository = userRepository;
    }

    public List<CooperativeBundle> getBundles(UUID htxShopId, BundleStatus status) {
        if (status != null) {
            return bundleRepository.findByHtxShopIdAndStatus(htxShopId, status);
        }
        return bundleRepository.findByHtxShopId(htxShopId);
    }

    public CooperativeBundle getById(UUID id) {
        return bundleRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy gói gom đơn", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public CooperativeBundle createBundle(CooperativeBundle bundle) {
        bundle.setStatus(BundleStatus.OPEN);
        bundle.setCurrentPledgedQuantity(BigDecimal.ZERO);
        return bundleRepository.save(bundle);
    }

    @Transactional
    public BundlePledge createPledge(UUID bundleId, UUID farmerId, BigDecimal quantity, String note) {
        CooperativeBundle bundle = getById(bundleId);
        if (bundle.getStatus() != BundleStatus.OPEN) {
            throw new AppException("Gói gom đơn không còn nhận đăng ký", HttpStatus.BAD_REQUEST);
        }

        if (pledgeRepository.existsByBundleIdAndFarmerId(bundleId, farmerId)) {
            throw new AppException("Bạn đã đăng ký tham gia gói này rồi", HttpStatus.CONFLICT);
        }

        // Check min pledge
        if (bundle.getMinPledgeQuantity() != null && quantity.compareTo(bundle.getMinPledgeQuantity()) < 0) {
            throw new AppException("Số lượng tối thiểu là " + bundle.getMinPledgeQuantity(), HttpStatus.BAD_REQUEST);
        }

        // Check not exceeding target
        BigDecimal remaining = bundle.getTargetQuantity().subtract(bundle.getCurrentPledgedQuantity());
        if (quantity.compareTo(remaining) > 0) {
            throw new AppException("Vượt quá số lượng còn cần (" + remaining + ")", HttpStatus.CONFLICT);
        }

        BundlePledge pledge = BundlePledge.builder()
                .bundleId(bundleId)
                .farmerId(farmerId)
                .quantity(quantity)
                .note(note)
                .status(PledgeStatus.ACTIVE)
                .build();
        pledgeRepository.save(pledge);

        // Update bundle progress
        bundle.setCurrentPledgedQuantity(bundle.getCurrentPledgedQuantity().add(quantity));
        if (bundle.getCurrentPledgedQuantity().compareTo(bundle.getTargetQuantity()) >= 0) {
            bundle.setStatus(BundleStatus.FULL);
        }
        bundleRepository.save(bundle);

        return pledge;
    }

    public List<BundlePledge> getBundlePledges(UUID bundleId) {
        return pledgeRepository.findByBundleId(bundleId);
    }

    public List<BundlePledge> getFarmerPledges(UUID farmerId) {
        return pledgeRepository.findByFarmerIdAndStatus(farmerId, PledgeStatus.ACTIVE);
    }

    @Transactional
    public void withdrawPledge(UUID pledgeId, UUID farmerId) {
        BundlePledge pledge = pledgeRepository.findById(pledgeId)
                .orElseThrow(() -> new AppException("Không tìm thấy pledge", HttpStatus.NOT_FOUND));

        if (!pledge.getFarmerId().equals(farmerId)) {
            throw new AppException("Bạn không có quyền rút pledge này", HttpStatus.FORBIDDEN);
        }

        CooperativeBundle bundle = getById(pledge.getBundleId());
        if (bundle.getStatus() != BundleStatus.OPEN) {
            throw new AppException("Chỉ có thể rút khi gói đang mở", HttpStatus.BAD_REQUEST);
        }

        pledge.setStatus(PledgeStatus.WITHDRAWN);
        pledgeRepository.save(pledge);

        bundle.setCurrentPledgedQuantity(bundle.getCurrentPledgedQuantity().subtract(pledge.getQuantity()));
        bundleRepository.save(bundle);
    }

    /**
     * Tính % đóng góp cho từng pledge.
     */
    public BigDecimal calculateContributionPercent(BundlePledge pledge, CooperativeBundle bundle) {
        if (bundle.getCurrentPledgedQuantity().compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return pledge.getQuantity()
                .divide(bundle.getCurrentPledgedQuantity(), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }
}
