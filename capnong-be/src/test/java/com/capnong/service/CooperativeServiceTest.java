package com.capnong.service;

import com.capnong.exception.AppException;
import com.capnong.model.CooperativeBundle;
import com.capnong.model.BundlePledge;
import com.capnong.model.enums.BundleStatus;
import com.capnong.model.enums.PledgeStatus;
import com.capnong.repository.CooperativeBundleRepository;
import com.capnong.repository.BundlePledgeRepository;
import com.capnong.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CooperativeServiceTest {

    @Mock private CooperativeBundleRepository bundleRepository;
    @Mock private BundlePledgeRepository pledgeRepository;
    @Mock private UserRepository userRepository;
    @InjectMocks private CooperativeService cooperativeService;

    private UUID bundleId;
    private UUID farmerId;
    private CooperativeBundle bundle;

    @BeforeEach
    void setUp() {
        bundleId = UUID.randomUUID();
        farmerId = UUID.randomUUID();
        bundle = CooperativeBundle.builder()
                .id(bundleId)
                .htxShopId(UUID.randomUUID())
                .targetQuantity(BigDecimal.valueOf(1000))
                .currentPledgedQuantity(BigDecimal.valueOf(400))
                .status(BundleStatus.OPEN)
                .build();
    }

    @Test
    void createPledge_shouldSucceed_whenBundleOpenAndQuantityValid() {
        when(bundleRepository.findById(bundleId)).thenReturn(Optional.of(bundle));
        when(pledgeRepository.existsByBundleIdAndFarmerId(bundleId, farmerId)).thenReturn(false);
        when(pledgeRepository.save(any(BundlePledge.class))).thenAnswer(i -> i.getArgument(0));
        when(bundleRepository.save(any(CooperativeBundle.class))).thenAnswer(i -> i.getArgument(0));

        BundlePledge result = cooperativeService.createPledge(bundleId, farmerId, BigDecimal.valueOf(100), null);

        assertEquals(PledgeStatus.ACTIVE, result.getStatus());
        assertEquals(0, BigDecimal.valueOf(500).compareTo(bundle.getCurrentPledgedQuantity()));
    }

    @Test
    void createPledge_shouldAutoClose_bundeWhenTargetReached() {
        bundle.setCurrentPledgedQuantity(BigDecimal.valueOf(900));
        when(bundleRepository.findById(bundleId)).thenReturn(Optional.of(bundle));
        when(pledgeRepository.existsByBundleIdAndFarmerId(bundleId, farmerId)).thenReturn(false);
        when(pledgeRepository.save(any(BundlePledge.class))).thenAnswer(i -> i.getArgument(0));
        when(bundleRepository.save(any(CooperativeBundle.class))).thenAnswer(i -> i.getArgument(0));

        cooperativeService.createPledge(bundleId, farmerId, BigDecimal.valueOf(100), null);

        assertEquals(BundleStatus.FULL, bundle.getStatus());
    }

    @Test
    void createPledge_shouldThrow_whenBundleClosed() {
        bundle.setStatus(BundleStatus.FULL);
        when(bundleRepository.findById(bundleId)).thenReturn(Optional.of(bundle));

        assertThrows(AppException.class, () ->
                cooperativeService.createPledge(bundleId, farmerId, BigDecimal.valueOf(100), null));
    }

    @Test
    void createPledge_shouldThrow_whenExceedingTarget() {
        when(bundleRepository.findById(bundleId)).thenReturn(Optional.of(bundle));
        when(pledgeRepository.existsByBundleIdAndFarmerId(bundleId, farmerId)).thenReturn(false);

        assertThrows(AppException.class, () ->
                cooperativeService.createPledge(bundleId, farmerId, BigDecimal.valueOf(700), null));
    }

    @Test
    void createPledge_shouldThrow_whenAlreadyPledged() {
        when(bundleRepository.findById(bundleId)).thenReturn(Optional.of(bundle));
        when(pledgeRepository.existsByBundleIdAndFarmerId(bundleId, farmerId)).thenReturn(true);

        assertThrows(AppException.class, () ->
                cooperativeService.createPledge(bundleId, farmerId, BigDecimal.valueOf(100), null));
    }

    @Test
    void calculateContributionPercent_shouldReturnCorrectPercent() {
        BundlePledge pledge = BundlePledge.builder()
                .quantity(BigDecimal.valueOf(200))
                .build();
        bundle.setCurrentPledgedQuantity(BigDecimal.valueOf(1000));

        BigDecimal result = cooperativeService.calculateContributionPercent(pledge, bundle);
        assertEquals(0, BigDecimal.valueOf(20).compareTo(result.setScale(0)));
    }
}
