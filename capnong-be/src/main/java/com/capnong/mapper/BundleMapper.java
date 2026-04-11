package com.capnong.mapper;

import com.capnong.dto.response.BundleResponseDto;
import com.capnong.dto.response.HtxSummaryDto;
import com.capnong.dto.response.PledgeResponseDto;
import com.capnong.dto.response.UserSummaryDto;
import com.capnong.model.BundlePledge;
import com.capnong.model.CooperativeBundle;
import com.capnong.model.HtxShop;
import com.capnong.model.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Manual mapper vì MapStruct annotation processor đang có issue trên Java 21.
 * Tất cả mapping logic nằm tập trung ở đây.
 */
@Component
public class BundleMapper {

    // ═══════════════════════════════════════════════════════════════
    // Bundle → BundleResponseDto
    // ═══════════════════════════════════════════════════════════════

    public BundleResponseDto toBundleDto(CooperativeBundle bundle) {
        return toBundleDto(bundle, true);
    }

    public BundleResponseDto toBundleDto(CooperativeBundle bundle, boolean includePledges) {
        if (bundle == null) return null;

        BigDecimal progress = BigDecimal.ZERO;
        if (bundle.getTargetQuantity() != null && bundle.getTargetQuantity().compareTo(BigDecimal.ZERO) > 0) {
            progress = bundle.getCurrentPledgedQuantity()
                    .divide(bundle.getTargetQuantity(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        List<PledgeResponseDto> pledgeDtos = Collections.emptyList();
        if (includePledges && bundle.getPledges() != null) {
            pledgeDtos = bundle.getPledges().stream()
                    .map(this::toPledgeDto)
                    .collect(Collectors.toList());
        }

        return BundleResponseDto.builder()
                .id(bundle.getId())
                .htxShop(toHtxShopInfo(bundle.getHtxShop()))
                .productCategory(bundle.getProductCategory() != null ? bundle.getProductCategory().name() : null)
                .productName(bundle.getProductName())
                .unitCode(bundle.getUnitCode())
                .targetQuantity(bundle.getTargetQuantity())
                .currentPledgedQuantity(bundle.getCurrentPledgedQuantity())
                .progressPercent(progress)
                .pricePerUnit(bundle.getPricePerUnit())
                .deadline(bundle.getDeadline())
                .status(bundle.getStatus() != null ? bundle.getStatus().name() : null)
                .description(bundle.getDescription())
                .minPledgeQuantity(bundle.getMinPledgeQuantity())
                .pledges(pledgeDtos)
                .createdAt(bundle.getCreatedAt())
                .build();
    }

    // ═══════════════════════════════════════════════════════════════
    // Pledge → PledgeResponseDto
    // ═══════════════════════════════════════════════════════════════

    public PledgeResponseDto toPledgeDto(BundlePledge pledge) {
        if (pledge == null) return null;

        return PledgeResponseDto.builder()
                .id(pledge.getId())
                .farmer(toUserSummary(pledge.getFarmer()))
                .quantity(pledge.getQuantity())
                .contributionPercent(pledge.getContributionPercent())
                .estimatedRevenue(pledge.getEstimatedRevenue())
                .status(pledge.getStatus() != null ? pledge.getStatus().name() : null)
                .note(pledge.getNote())
                .createdAt(pledge.getCreatedAt())
                .build();
    }

    // ═══════════════════════════════════════════════════════════════
    // Nested DTOs
    // ═══════════════════════════════════════════════════════════════

    private BundleResponseDto.HtxShopInfo toHtxShopInfo(HtxShop shop) {
        if (shop == null) return null;

        HtxSummaryDto htxSummary = null;
        if (shop.getHtx() != null) {
            htxSummary = HtxSummaryDto.builder()
                    .id(shop.getHtx().getId())
                    .name(shop.getHtx().getName())
                    .province(shop.getHtx().getProvince())
                    .status(shop.getHtx().getStatus() != null ? shop.getHtx().getStatus().name() : null)
                    .build();
        }

        return BundleResponseDto.HtxShopInfo.builder()
                .id(shop.getId())
                .slug(shop.getSlug())
                .name(shop.getName())
                .description(shop.getDescription())
                .avatarUrl(shop.getAvatarUrl())
                .htx(htxSummary)
                .build();
    }

    private UserSummaryDto toUserSummary(User user) {
        if (user == null) return null;
        return UserSummaryDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .build();
    }
}
