package com.capnong.service;

import com.capnong.dto.request.BundleCreateRequest;
import com.capnong.dto.request.PledgeRequest;
import com.capnong.dto.response.BundleResponseDto;
import com.capnong.dto.response.PledgeResponseDto;
import com.capnong.dto.response.ShopResponse;

import java.util.List;
import java.util.UUID;

public interface CooperativeService {
    // Management
    ShopResponse createExplicitHtxShop(UUID managerId);
    // Query
    List<BundleResponseDto> getOpenBundles();
    List<BundleResponseDto> getMyHtxBundles(UUID managerId);
    BundleResponseDto getBundleById(UUID bundleId);
    List<BundleResponseDto> getShopBundles(UUID htxShopId);
    List<BundleResponseDto> getShopBundlesByShopId(UUID shopId);
    List<PledgeResponseDto> getMyPledges(UUID farmerId);

    // Bundle lifecycle
    BundleResponseDto createBundle(BundleCreateRequest request, UUID managerId);
    BundleResponseDto cancelBundle(UUID bundleId, UUID managerId);
    BundleResponseDto confirmBundle(UUID bundleId, UUID managerId);

    // Pledge lifecycle
    PledgeResponseDto createPledge(UUID bundleId, PledgeRequest request, UUID farmerId);
    void withdrawPledge(UUID pledgeId, UUID farmerId);

    // Scheduler
    int expireOpenBundles();
}
