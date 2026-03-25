package com.capnong.model;

import com.capnong.model.enums.ConfiguredBy;
import com.capnong.model.enums.ProductCategory;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "seasonal_configs",
       uniqueConstraints = @UniqueConstraint(columnNames = {"province", "product_category", "configured_by"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SeasonalConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String province;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_category", nullable = false, length = 20)
    private ProductCategory productCategory;

    @Column(name = "start_month", nullable = false)
    private Short startMonth;

    @Column(name = "end_month", nullable = false)
    private Short endMonth;

    @Enumerated(EnumType.STRING)
    @Column(name = "configured_by", nullable = false, length = 20)
    private ConfiguredBy configuredBy;

    @Column(name = "configured_by_id", nullable = false)
    private UUID configuredById;

    @Column(columnDefinition = "TEXT")
    private String note;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
