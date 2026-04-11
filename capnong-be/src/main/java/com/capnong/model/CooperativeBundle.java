package com.capnong.model;

import com.capnong.model.enums.BundleStatus;
import com.capnong.model.enums.ProductCategory;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "cooperative_bundles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CooperativeBundle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "htx_shop_id", nullable = false)
    private UUID htxShopId;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_category", nullable = false, length = 20)
    private ProductCategory productCategory;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(name = "unit_code", nullable = false, length = 10)
    private String unitCode;

    @Column(name = "target_quantity", nullable = false, precision = 12, scale = 3)
    private BigDecimal targetQuantity;

    @Column(name = "current_pledged_quantity", nullable = false, precision = 12, scale = 3)
    @Builder.Default
    private BigDecimal currentPledgedQuantity = BigDecimal.ZERO;

    @Column(name = "price_per_unit", nullable = false, precision = 15, scale = 2)
    private BigDecimal pricePerUnit;

    @Column(nullable = false)
    private LocalDate deadline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private BundleStatus status = BundleStatus.OPEN;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "min_pledge_quantity", precision = 12, scale = 3)
    private BigDecimal minPledgeQuantity;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
