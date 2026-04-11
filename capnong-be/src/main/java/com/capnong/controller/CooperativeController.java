package com.capnong.controller;

import com.capnong.dto.response.ApiResponse;
import com.capnong.exception.AppException;
import com.capnong.model.BundlePledge;
import com.capnong.model.CooperativeBundle;
import com.capnong.model.enums.BundleStatus;
import com.capnong.model.enums.PledgeStatus;
import com.capnong.model.enums.ProductCategory;
import com.capnong.repository.BundlePledgeRepository;
import com.capnong.repository.CooperativeBundleRepository;
import com.capnong.security.UserDetailsImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.MathContext;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cooperatives")
public class CooperativeController {

    private final CooperativeBundleRepository bundleRepository;
    private final BundlePledgeRepository pledgeRepository;

    public CooperativeController(CooperativeBundleRepository bundleRepository,
                                  BundlePledgeRepository pledgeRepository) {
        this.bundleRepository = bundleRepository;
        this.pledgeRepository = pledgeRepository;
    }

    // ─── Bundle CRUD ────────────────────────────

    @GetMapping("/bundles")
    public ResponseEntity<ApiResponse<List<CooperativeBundle>>> getOpenBundles() {
        List<CooperativeBundle> bundles = bundleRepository.findByStatus(BundleStatus.OPEN);
        return ResponseEntity.ok(ApiResponse.success("OK", bundles));
    }

    @GetMapping("/bundles/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBundle(@PathVariable UUID id) {
        CooperativeBundle bundle = bundleRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy gói", HttpStatus.NOT_FOUND));
        List<BundlePledge> pledges = pledgeRepository.findByBundleIdAndStatus(id, PledgeStatus.ACTIVE);
        return ResponseEntity.ok(ApiResponse.success("OK",
                Map.of("bundle", bundle, "pledges", pledges)));
    }

    @PostMapping("/bundles")
    @PreAuthorize("hasRole('HTX_MANAGER')")
    public ResponseEntity<ApiResponse<CooperativeBundle>> createBundle(
            @RequestBody CooperativeBundle bundle) {
        bundle.setStatus(BundleStatus.OPEN);
        bundle.setCurrentPledgedQuantity(BigDecimal.ZERO);
        CooperativeBundle saved = bundleRepository.save(bundle);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo gói thu mua thành công", saved));
    }

    // ─── Pledge (cam kết nông sản) ──────────────

    @PostMapping("/bundles/{bundleId}/pledges")
    @PreAuthorize("hasAnyRole('FARMER','HTX_MEMBER')")
    public ResponseEntity<ApiResponse<BundlePledge>> addPledge(
            @PathVariable UUID bundleId,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, Object> body) {

        CooperativeBundle bundle = bundleRepository.findById(bundleId)
                .orElseThrow(() -> new AppException("Không tìm thấy gói", HttpStatus.NOT_FOUND));

        if (bundle.getStatus() != BundleStatus.OPEN) {
            throw new AppException("Gói không còn mở", HttpStatus.BAD_REQUEST);
        }
        if (pledgeRepository.existsByBundleIdAndFarmerId(bundleId, userDetails.getId())) {
            throw new AppException("Bạn đã cam kết rồi", HttpStatus.CONFLICT);
        }

        BigDecimal quantity = new BigDecimal(body.get("quantity").toString());

        // Check min pledge
        if (bundle.getMinPledgeQuantity() != null && quantity.compareTo(bundle.getMinPledgeQuantity()) < 0) {
            throw new AppException("Số lượng tối thiểu là " + bundle.getMinPledgeQuantity(), HttpStatus.BAD_REQUEST);
        }

        // Check remaining capacity
        BigDecimal remaining = bundle.getTargetQuantity().subtract(bundle.getCurrentPledgedQuantity());
        if (quantity.compareTo(remaining) > 0) {
            throw new AppException("Số lượng vượt quá dung lượng còn lại: " + remaining, HttpStatus.BAD_REQUEST);
        }

        // Calculate contribution %
        BigDecimal newTotal = bundle.getCurrentPledgedQuantity().add(quantity);
        BigDecimal percent = quantity.divide(bundle.getTargetQuantity(), MathContext.DECIMAL64)
                .multiply(BigDecimal.valueOf(100));

        BundlePledge pledge = BundlePledge.builder()
                .bundleId(bundleId)
                .farmerId(userDetails.getId())
                .quantity(quantity)
                .contributionPercent(percent)
                .estimatedRevenue(bundle.getPricePerUnit().multiply(quantity))
                .note((String) body.get("note"))
                .build();
        pledgeRepository.save(pledge);

        // Update bundle total
        bundle.setCurrentPledgedQuantity(newTotal);
        if (newTotal.compareTo(bundle.getTargetQuantity()) >= 0) {
            bundle.setStatus(BundleStatus.FULL);
        }
        bundleRepository.save(bundle);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Cam kết thành công", pledge));
    }

    @DeleteMapping("/pledges/{pledgeId}")
    @PreAuthorize("hasAnyRole('FARMER','HTX_MEMBER')")
    public ResponseEntity<ApiResponse<Void>> withdrawPledge(
            @PathVariable UUID pledgeId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        BundlePledge pledge = pledgeRepository.findById(pledgeId)
                .orElseThrow(() -> new AppException("Không tìm thấy cam kết", HttpStatus.NOT_FOUND));

        if (!pledge.getFarmerId().equals(userDetails.getId())) {
            throw new AppException("Không có quyền", HttpStatus.FORBIDDEN);
        }
        if (pledge.getStatus() != PledgeStatus.ACTIVE) {
            throw new AppException("Cam kết không thể rút", HttpStatus.BAD_REQUEST);
        }

        pledge.setStatus(PledgeStatus.WITHDRAWN);
        pledgeRepository.save(pledge);

        // Update bundle total
        CooperativeBundle bundle = bundleRepository.findById(pledge.getBundleId()).get();
        bundle.setCurrentPledgedQuantity(bundle.getCurrentPledgedQuantity().subtract(pledge.getQuantity()));
        if (bundle.getStatus() == BundleStatus.FULL) {
            bundle.setStatus(BundleStatus.OPEN);
        }
        bundleRepository.save(bundle);

        return ResponseEntity.ok(ApiResponse.success("Đã rút cam kết", null));
    }

    @GetMapping("/my-pledges")
    @PreAuthorize("hasAnyRole('FARMER','HTX_MEMBER')")
    public ResponseEntity<ApiResponse<List<BundlePledge>>> getMyPledges(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<BundlePledge> pledges = pledgeRepository.findByFarmerIdAndStatus(
                userDetails.getId(), PledgeStatus.ACTIVE);
        return ResponseEntity.ok(ApiResponse.success("OK", pledges));
    }
}
