package com.capnong.model;

import com.capnong.model.enums.FarmingMethod;
import com.capnong.model.enums.ProductCategory;
import com.capnong.model.enums.ProductStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @SuperBuilder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@SQLRestriction("deleted = false")
public class Product extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = false)
    private Shop shop;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProductCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_code", referencedColumnName = "code", nullable = false)
    private Unit unit;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal pricePerUnit;

    @Column(nullable = false, precision = 12, scale = 3)
    private BigDecimal availableQuantity;

    private LocalDate harvestDate;

    private LocalDate availableFrom;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private FarmingMethod farmingMethod = FarmingMethod.TRADITIONAL;

    @Column(nullable = false)
    @Builder.Default
    private Boolean pesticideFree = false;

    @Column(nullable = false)
    private String locationDetail;

    @Column(columnDefinition = "TEXT")
    private String origin;

    @Column(name = "min_order_quantity", precision = 12, scale = 3)
    @Builder.Default
    private BigDecimal minOrderQuantity = BigDecimal.ONE;

    @Column(name = "weight_per_unit", precision = 12, scale = 3)
    private BigDecimal weight;

    @Column(name = "shelf_life")
    private String shelfLife;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ProductStatus status = ProductStatus.UPCOMING;

    @Column(precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal averageRating = BigDecimal.ZERO;

    @Builder.Default
    private Integer totalReviews = 0;

    @Column(name = "total_sold")
    @Builder.Default
    private Integer totalSold = 0;

    /** Non-null khi product được tạo từ Bundle (virtual product cho wholesale) */
    @Column(name = "bundle_id")
    private java.util.UUID bundleId;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();
}