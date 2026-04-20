package com.capnong.service;

import com.capnong.dto.request.PledgeRequest;
import com.capnong.dto.response.PledgeResponseDto;
import com.capnong.exception.AppException;
import com.capnong.mapper.BundleMapper;
import com.capnong.model.*;
import com.capnong.model.enums.BundleStatus;
import com.capnong.model.enums.PledgeStatus;
import com.capnong.repository.*;
import com.capnong.service.impl.CooperativeServiceImpl;
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
    @Mock private HtxShopRepository htxShopRepository;
    @Mock private HtxRepository htxRepository;
    @Mock private UserRepository userRepository;
    @Mock private ProductRepository productRepository;
    @Mock private ShopRepository shopRepository;
    @Mock private UnitRepository unitRepository;
    @Mock private TelegramNotificationService telegramNotificationService;
    @Mock private BundleMapper bundleMapper;

    @InjectMocks private CooperativeServiceImpl cooperativeService;

    private UUID bundleId;
    private UUID farmerId;
    private CooperativeBundle bundle;
    private User farmer;

    @BeforeEach
    void setUp() {
        bundleId = UUID.randomUUID();
        farmerId = UUID.randomUUID();
        farmer = User.builder().id(farmerId).fullName("Farmer Test").build();
        bundle = CooperativeBundle.builder()
                .id(bundleId)
                .htxShop(HtxShop.builder().build())
                .targetQuantity(BigDecimal.valueOf(1000))
                .currentPledgedQuantity(BigDecimal.valueOf(400))
                .unitCode("KG")
                .productName("Lúa gạo")
                .status(BundleStatus.OPEN)
                .build();
    }

    @Test
    void createPledge_shouldSucceed_whenBundleOpenAndQuantityValid() {
        PledgeRequest request = PledgeRequest.builder().quantity(100.0).build();

        when(bundleRepository.findById(bundleId)).thenReturn(Optional.of(bundle));
        when(userRepository.findById(farmerId)).thenReturn(Optional.of(farmer));
        when(pledgeRepository.existsByBundle_IdAndFarmer_Id(bundleId, farmerId)).thenReturn(false);
        when(pledgeRepository.save(any(BundlePledge.class))).thenAnswer(i -> i.getArgument(0));
        when(bundleRepository.save(any(CooperativeBundle.class))).thenAnswer(i -> i.getArgument(0));
        when(bundleMapper.toPledgeDto(any())).thenReturn(PledgeResponseDto.builder().build());

        PledgeResponseDto result = cooperativeService.createPledge(bundleId, request, farmerId);

        assertNotNull(result);
        assertEquals(0, BigDecimal.valueOf(500).compareTo(bundle.getCurrentPledgedQuantity()));
    }

    @Test
    void createPledge_shouldAutoCloseBundleWhenTargetReached() {
        bundle.setCurrentPledgedQuantity(BigDecimal.valueOf(900));
        PledgeRequest request = PledgeRequest.builder().quantity(100.0).build();

        when(bundleRepository.findById(bundleId)).thenReturn(Optional.of(bundle));
        when(userRepository.findById(farmerId)).thenReturn(Optional.of(farmer));
        when(pledgeRepository.existsByBundle_IdAndFarmer_Id(bundleId, farmerId)).thenReturn(false);
        when(pledgeRepository.save(any(BundlePledge.class))).thenAnswer(i -> i.getArgument(0));
        when(bundleRepository.save(any(CooperativeBundle.class))).thenAnswer(i -> i.getArgument(0));
        when(bundleMapper.toPledgeDto(any())).thenReturn(PledgeResponseDto.builder().build());

        // Bundle has HTX with manager for notification
        Htx htx = Htx.builder().manager(User.builder().id(UUID.randomUUID()).build()).build();
        HtxShop htxShop = HtxShop.builder().htx(htx).build();
        bundle.setHtxShop(htxShop);

        cooperativeService.createPledge(bundleId, request, farmerId);

        assertEquals(BundleStatus.FULL, bundle.getStatus());
    }

    @Test
    void createPledge_shouldThrow_whenBundleClosed() {
        bundle.setStatus(BundleStatus.FULL);
        PledgeRequest request = PledgeRequest.builder().quantity(100.0).build();

        when(bundleRepository.findById(bundleId)).thenReturn(Optional.of(bundle));
        when(userRepository.findById(farmerId)).thenReturn(Optional.of(farmer));

        assertThrows(AppException.class, () ->
                cooperativeService.createPledge(bundleId, request, farmerId));
    }

    @Test
    void createPledge_shouldThrow_whenExceedingTarget() {
        PledgeRequest request = PledgeRequest.builder().quantity(700.0).build();

        when(bundleRepository.findById(bundleId)).thenReturn(Optional.of(bundle));
        when(userRepository.findById(farmerId)).thenReturn(Optional.of(farmer));
        when(pledgeRepository.existsByBundle_IdAndFarmer_Id(bundleId, farmerId)).thenReturn(false);

        assertThrows(AppException.class, () ->
                cooperativeService.createPledge(bundleId, request, farmerId));
    }

    @Test
    void createPledge_shouldThrow_whenAlreadyPledged() {
        PledgeRequest request = PledgeRequest.builder().quantity(100.0).build();

        when(bundleRepository.findById(bundleId)).thenReturn(Optional.of(bundle));
        when(userRepository.findById(farmerId)).thenReturn(Optional.of(farmer));
        when(pledgeRepository.existsByBundle_IdAndFarmer_Id(bundleId, farmerId)).thenReturn(true);

        assertThrows(AppException.class, () ->
                cooperativeService.createPledge(bundleId, request, farmerId));
    }
}
