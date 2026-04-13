package com.capnong.model;

import com.capnong.model.enums.BundleStatus;
import com.capnong.model.enums.ProductCategory;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "cooperative_bundles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CooperativeBundle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /* ─── Relationships ─── */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "htx_shop_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private HtxShop htxShop;

    @OneToMany(mappedBy = "bundle", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BundlePledge> pledges = new ArrayList<>();

    /** Product ảo được tạo từ Bundle — để buyer browse & checkout */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    /* ─── Bundle Info ─── */

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
