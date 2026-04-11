package com.capnong.model;

import com.capnong.model.enums.ConfiguredBy;
import com.capnong.model.enums.ProductCategory;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "seasonal_configs",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"province", "product_category", "configured_by"}
        ))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @SuperBuilder
@SQLRestriction("deleted = false")
public class SeasonalConfig extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String province;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_category", nullable = false, length = 20)
    private ProductCategory productCategory;

    @Column(nullable = false)
    private Short startMonth;

    @Column(nullable = false)
    private Short endMonth;

    @Enumerated(EnumType.STRING)
    @Column(name = "configured_by", nullable = false, length = 20)
    private ConfiguredBy configuredBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "configured_by_id", nullable = false)
    private User configuredByUser;

    @Column(columnDefinition = "TEXT")
    private String note;
}
